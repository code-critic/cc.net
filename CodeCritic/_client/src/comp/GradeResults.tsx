import { Button, Dialog } from '@material-ui/core';
import GridOnIcon from '@material-ui/icons/GridOn';
import InsertChartIcon from '@material-ui/icons/InsertChart';
import React, { useState } from 'react';
import { NotificationManager } from 'react-notifications';
import ReactTable, { RowInfo } from 'react-table';
import { SimpleLoader } from '../components/SimpleLoader';
import { StudentResultsDialogForTeacher } from '../components/StudentResultsDialog';
import { useResource } from '../components/useResource';
import { ICcData, ICcDataResult, ICourseProblem, IGradeDto, ISingleCourse } from '../models/DataModel';
import { ProcessStatusCodes } from '../models/Enums';
import { GenerateSheet } from './GradeResults.Sheet';
import { ProblemPicker } from './ProblemPicker';
import { defaultColumns, getStatusOrDefault } from './result.columns';

export const Graderesults = () => {
    return <div>
        <ProblemPicker
            baseUrl="/grade-results"
            home={<><InsertChartIcon />Grade</>}
            component={GraderesultsImpl}
            withBreadcrumbs
            whereUserIsTeacher
        />
    </div>
}

interface GraderesultsImplProps {
    course: ISingleCourse;
    problem: ICourseProblem;
}

function getStatus(result: ICcDataResult) {
    return `status-${getStatusOrDefault(result)}`;
}

const GraderesultsImpl = (props: GraderesultsImplProps) => {
    const { course, problem } = props;
    const [result, setResult] = React.useState<ICcData>();
    const [rng, setRng] = React.useState(Math.random());
    const [exportData, setExportData] = useState<any>();
    const [pageSize, setPageSize] = useState(10);
    const [page, setPage] = useState(0);

    const stats = useResource<IGradeDto[]>(!course || !problem
        ? undefined
        : `grade-stats/${course.course}/${course.year}/${problem.id}?rng=${rng}`);
    const needsSelect = !course || !problem;

    const renderTable = () => {
        if (!stats) {
            return <SimpleLoader title="loading stats" />
        }

        const data = (stats as any).map(i => i.result);
        const columns = defaultColumns([]);
        
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


        const onPageSizeChange = (newPageSize: number, newPage: number) => {
            setPageSize(newPageSize);
            onPageChange(newPage);
        }

        const onPageChange = (page: number) => {
            setPage(page);
        }

        return <ReactTable
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