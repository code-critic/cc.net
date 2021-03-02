import React, { useState } from 'react';
import { Box, Dialog, Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import GridOnIcon from '@material-ui/icons/GridOn';
import Alert from '@material-ui/lab/Alert';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import { NotificationManager } from 'react-notifications';
import Spreadsheet from "react-spreadsheet";
import { RowInfo } from 'react-table';
import { userCanBeRoot } from '../init';
import { ICcData, ICourse, ICourseProblem, IGradeDto, ISingleCourse } from '../models/DataModel';
import { ProcessStatusCodes, ProcessStatusStatic } from '../models/Enums';
import { getColumns, getStatus } from '../routes/StudentResultList.Columns';
import { StudentResultListModel } from '../routes/StudentResultList.Model';
import { flattenCourse } from '../utils/DataUtils';
import { nestGet } from '../utils/NestGetter';
import { ReactTableWithSelect } from '../utils/ReactTableWithSelect';
import { SimpleLoader } from './SimpleLoader';
import { StudentResultsDialogForTeacher } from './StudentResultsDialog';
import moment from 'moment';
import XLSX from 'xlsx';
import { DropDownMenu } from './DropDownMenu';
import { useResource } from './useResource';
import { nameof } from 'ts-simple-nameof';


interface SelectCourseAndProblem {
    setCourse: (item: ISingleCourse) => void;
    course?: ISingleCourse;
    setProblem: (item: ICourseProblem) => void;
    problem?: ICourseProblem;

    stats?: IGradeDto[];
}
interface Graderesults {
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
    const { course, problem, setCourse, setProblem, stats } = props;
    const courses = useResource<ICourse[]>("courses");
    const coursesFlatten = courses ? courses.flatMap(flattenCourse) : [];
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
    const [exportData, setExportData] = useState<any>();
    const [pageSize, setPageSize] = useState(10);
    const [page, setPage] = useState(0);

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
            if (result.result.status == ProcessStatusCodes.NoSolution) {
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

        const onPageSizeChange = (newPageSize: number, newPage: number) => {
            setPageSize(newPageSize);
            onPageChange(newPage);
        }

        const onPageChange = (page: number) => {
            setPage(page);
        }

        return <ReactTableWithSelect
            extractData={(key: string) => extractData(key)}
            data={data}
            loading={isLoading}
            columns={columns}
            className={`-highlight`}
            onFetchData={(state: any, instance: any) => onFetchData(state)}
            onPageSizeChange={onPageSizeChange}
            onPageChange={onPageChange}
            defaultPageSize={pageSize}
            page={page}
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

        {!needsSelect && <>
            {renderTable()}
            <div>
                <Button endIcon={<GridOnIcon />} onClick={() => setExportData(stats)}>Generate Excel Sheet</Button>
            </div>
        </>
        }

        {result && <>
            <StudentResultsDialogForTeacher
                result={result}
                onClose={() => setResult(undefined)}
                onRefresh={() => setRng(Math.random())} />
        </>}


        {exportData && stats != undefined && <Dialog open onClose={() => setExportData(null)} fullWidth maxWidth="lg">
            <GenerateSheet name={problem?.id ?? "report"} stats={stats} />
        </Dialog>}
    </>)
}

interface DefaultCellValue {
    value: string | number | boolean | null,
}
type Matrix<T> = Array<Array<T | typeof undefined>>;
interface GenerateSheetProps {
    stats: IGradeDto[];
    name: string;
}

let exportData: Matrix<DefaultCellValue> = [];
export const GenerateSheet = (props: GenerateSheetProps) => {
    const { stats, name } = props;
    const sorted = stats.sort((a, b) => a.user.id.localeCompare(b.user.id));
    const header: DefaultCellValue[] = [{ value: "Date" }, { value: "User" }, { value: "Points" }, { value: "Status" }, { value: "Comment" }];
    const data: Matrix<DefaultCellValue> = [
        header,
        ...(sorted.map(i => {
            return [
                { value: moment(i.result.id.creationTime).format("YYYY/MM/DD hh:mm:ss") },
                { value: i.user.id },
                { value: i.result.points },
                { value: ProcessStatusStatic.All.find(j => j.value == i.result.result.status)?.name ?? null },
                { value: i.result.gradeComment },
            ];
        })),
        []
    ];

    exportData = data;
    const handleChange = (newData: Matrix<DefaultCellValue>) => {
        exportData = newData;
    }

    const download = (bookType: any) => {
        // const cols = exportData[0].map((i, j) => { return { name: i?.value, key: j } } );
        // const aoa: any = { cols: cols, data: data };
        // const table = document.getElementsByClassName("Spreadsheet__table")[0];
        // const wb = XLSX.utils.table_to_book(table, { sheetRows: 5 });

        const data = exportData.slice(1).map(i => i.map(j => j?.value));
        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, name);
        XLSX.writeFile(wb, `${name}.${bookType}`, { bookType: bookType });
    }

    // 'xlsx' | 'xlsm' | 'xlsb' | 'xls' | 'xla' | 'biff8' | 'biff5' | 'biff2' | 'xlml' |
    // 'ods' | 'fods' | 'csv' | 'txt' | 'sylk' | 'html' | 'dif' | 'rtf' | 'prn' | 'eth';
    const options = ["xlsx", "xls", "ods", "html", "csv", "txt"];

    return <div className="data-export">
            <div>
                <DropDownMenu title="Download as..."
                    getLabel={i => i}
                    onChange={i => download(i)}
                    options={options} />
            </div>
            <div>
                <Spreadsheet onChange={handleChange} data={data} />
            </div>
        </div>
}