import React, { useState, useEffect } from 'react'
import { ISingleCourse, ICourseProblem, ICourseYearConfig, ICourse, ICcData, IGradeDto } from '../models/DataModel';
import { httpClient, userIsRoot, userCanBeRoot } from '../init';
import { SimpleLoader } from './SimpleLoader';
import Button from '@material-ui/core/Button';
import { flattenCourse } from '../utils/DataUtils';
import { Card, Grid, Paper, Typography, Box, ButtonGroup } from '@material-ui/core';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import { ReactTableWithSelect } from '../utils/ReactTableWithSelect';
import { getColumns, getStatus } from '../routes/StudentResultList.Columns';
import { StudentResultListModel } from '../routes/StudentResultList.Model';
import { RowInfo } from 'react-table';
import { nestGet } from '../utils/NestGetter';
import { ProcessStatusCodes } from '../models/Enums';
import Alert from '@material-ui/lab/Alert';
import { StudentResultsDialogForTeacher } from './StudentResultsDialog';
import { NotificationManager } from 'react-notifications';

interface SelectCourseAndProblem {
    setCourse: (item: ISingleCourse) => void;
    course?: ISingleCourse;
    setProblem: (item: ICourseProblem) => void;
    problem?: ICourseProblem;

    stats?: IGradeDto[];
}
interface Graderesults {
}


export function useResource<T>(url?: string) {
    const [resource, serResource] = useState<T>();
    useEffect(() => {
        if (url) {
            serResource(undefined);
            httpClient.fetch(url, undefined, "auto")
                .then(serResource)
                .catch(e => serResource(undefined));
        }
    }, [url]);

    return resource;
}

interface SimpleCardProps {
    title: string;
    subtitle?: string;
    onClick?: () => void;
}
export const SimpleCard = (props: SimpleCardProps) => {
    const { title, subtitle, onClick } = props;

    return <Button onClick={() => onClick ? onClick() : null} className="p-2 text-center" variant="outlined">
        <Box display="flex" flexDirection="column">
            <Typography variant="body2" component="h6">{title}</Typography>
            {subtitle && <Typography variant="body2" component="small">{subtitle}</Typography>}
        </Box>
    </Button>
}

export const SelectCourseAndProblem = (props: SelectCourseAndProblem) => {
    // console.log("SelectCourseAndProblem", props);
    const { course, problem, setCourse, setProblem, stats } = props;
    const courses = useResource<ICourse[]>("courses");
    const coursesFlatten = courses ? courses.flatMap(flattenCourse) : [];
    // const problems = useResource<ICourseYearConfig>(course ? `course/${course.course}/${course.year}` : undefined);
    const problems = course ? course.problems : undefined;

    const handerCourseSelected = (i: ISingleCourse) => {
        setCourse(i);
        setProblem(undefined as any);
    }

    const renderCourses = () => {
        if (!courses) {
            return <SimpleLoader title="loading courses" />
        }
        return (<ToggleButtonGroup exclusive value={`${course?.course}-${course?.year}`} size="small" className="styled color-a">
            {coursesFlatten.map((i, j) =>
                <ToggleButton onClick={() => handerCourseSelected(i)} value={`${i?.course}-${i?.year}`} key={j}>
                    <Box display="flex" flexDirection="column">
                        <Typography variant="body2" component="h6">{i.course}</Typography>
                        <Typography variant="body2" component="small">{i.year}</Typography>
                    </Box>
                </ToggleButton>
            )}
        </ToggleButtonGroup >)
    }

    const renderProblems = () => {
        if (!problems) {
            return <SimpleLoader title="loading problems" />
        }

        return (<ToggleButtonGroup exclusive value={`${problem?.id}`} size="small" className="styled color-b">
            {problems.map((i, j) =>
                <ToggleButton onClick={() => setProblem(i)} value={`${i?.id}`} key={j}>
                    <Box display="flex" flexDirection="column">
                        <Typography variant="body2" component="h6">{i.id}</Typography>
                        <Typography variant="body2" className="tiny" component="small">{i.name.replace(i.id, "")}</Typography>
                    </Box>
                </ToggleButton>
            )}
        </ToggleButtonGroup >)
    }

    return (<>
        <Box display="flex" alignItems="center">
            {renderCourses()}
            {course && <>
                <ArrowForwardIosIcon fontSize="large" />
                {renderProblems()}
            </>}
        </Box>

        {stats && <Alert severity="info">
            {stats.filter(i => i.result.result.status == ProcessStatusCodes.NoSolution).length}
                / {stats.length} did not send any solution
        </Alert>}

    </>)
}

export const Graderesults = (props) => {
    const [course, setCourse] = React.useState<ISingleCourse>();
    const [problem, setProblem] = React.useState<ICourseProblem>();
    const [result, setResult] = React.useState<ICcData>();
    const [rng, setRng] = React.useState(Math.random());

    const stats = useResource<IGradeDto[]>(!course || !problem
        ? undefined
        : `grade-stats/${course.course}/${course.year}/${problem.id}?rng=${rng}`);
    const needsSelect = !course || !problem;

    if (!userCanBeRoot()) {
        // throw new Error("Access denied");
    }

    const renderTable = () => {
        if (!stats) {
            return <SimpleLoader title="loading stats" />
        }

        const showFilters = false;
        const model = new StudentResultListModel();
        const data = (stats as any).map(i => i.result);
        const columns = getColumns(model, [], showFilters)
            .filter(i => i.Header != "Problem");
        const isLoading = false;

        const onFetchData = (state) => { }

        const openDetail = (result: ICcData) => {
            if (result.result.status == ProcessStatusCodes.NoSolution)
            {
                NotificationManager.warning(
                    `Result only exists virtually, student ${result.user} did not send any solution`,
                    "Cannot open the result");
            } else {
                setResult(result);
            }
        }

        const extractData = (key: string) => {
            if (key === "result") {
                return data.map(d => nestGet(d, "result.score"));
            }
            return data.map(d => nestGet(d, key));
        }

        return <ReactTableWithSelect
            extractData={(key: string) => extractData(key)}
            data={data}
            loading={isLoading}
            columns={columns}
            className={`-highlight`}
            onFetchData={(state: any, instance: any) => onFetchData(state)}
            defaultPageSize={10}
            showPagination={true}
            defaultSorted={[
                {
                    id: "id.timestamp",
                    desc: true
                }
            ]}
            getTrProps={(_finalState: any, rowInfo?: RowInfo) => {
                if (!rowInfo) {
                    return {};
                }
                var data: ICcData = rowInfo.row;
                return {
                    className: getStatus(data.result),
                    onClick: (e) => {
                        openDetail((data as any)._original);
                    }
                };
            }}
        />;
    }

    return (<>
        <SelectCourseAndProblem
            setCourse={setCourse} course={course}
            setProblem={setProblem} problem={problem}
            stats={stats}
        />

        {!needsSelect &&
            <>{renderTable()}</>
        }
        {result && <StudentResultsDialogForTeacher
            result={result}
            onClose={() => setResult(undefined)}
            onRefresh={() => setRng(Math.random())}
        />}
    </>)
}
