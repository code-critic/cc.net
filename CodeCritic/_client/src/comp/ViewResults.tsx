import React, { useEffect, useState } from 'react';
import { ICcData, ICcDataResult, ICourseProblem, ILanguage, ISingleCourse, ITableRequest, ITableRequestFilter, ITableResponse } from '../models/DataModel';
import { ProblemPicker, ProblemPickerExportProps } from './ProblemPicker';
import AssignmentIndIcon from '@material-ui/icons/AssignmentInd';
import ReactTable, { Column, RowInfo } from 'react-table';
import { defaultColumns, getStatusOrDefault } from './result.columns';
import { API } from '../api';
import { IApiResponse } from '../models/CustomModel';
import { AxiosResponse } from 'axios';
import { useParams } from 'react-router';
import { StudentResultsDialogForTeacher } from '../components/StudentResultsDialog';
import { debounce } from 'throttle-debounce';

export const ViewResults = () => {
    return <div>
        <ProblemPicker
            baseUrl="/view-results"
            home={<><AssignmentIndIcon />Results</>}
            component={ViewResultsImpl}
            withBreadcrumbs
            displayAlways
        />
    </div>
}

interface ViewResultsImplProps extends Partial<ProblemPickerExportProps> {
}

function getStatus(result: ICcDataResult) {
    return `status-${getStatusOrDefault(result)}`;
}

const addToFilters = (filters: ITableRequestFilter[], course?: string, year?: string, problem?: string) => {

    const defaultValues = [course, year, problem];
    const names = ["courseName", "courseYear", "problem"];
    const values = names.map((i, j) => filters.find(k => k.id == i)?.value ?? defaultValues[j]);

    return [
        ...filters.filter(i => !names.includes(i.id)),
        ...names.map((i, j) => {
            return { id: i, value: values[j] }
        }),
    ].filter(i => i.value != null && i.value.length > 0) as ITableRequestFilter[];
}

const ViewResultsImpl = (props: ViewResultsImplProps) => {
    // const { problem, course } = props;
    const { course, year, problem } = useParams<any>();
    const [tableResponse, setTableResponse] = useState<ITableResponse>({ count: 0, data: [] });
    const [pages, setPages] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [state, setState] = useState<ITableRequest>();
    const [gradeResult, setGradeResult] = useState<ICcData>();
    const [rng, setRng] = React.useState(Math.random());

    const refresh = () => {
        setRng(Math.random());
    }

    const fetchData = async (state: any) => {
        setIsLoading(true);
        const { pageSize, page, sorted, filtered } = state;
        const lastReq: ITableRequest = { pageSize, page, sorted, filtered };
        const request: ITableRequest = { pageSize, page, sorted, filtered };
        request.filtered = addToFilters(request.filtered, course, year, problem);

        const axiosResponse = await API.post<ITableRequest, AxiosResponse<IApiResponse<ITableResponse>>>
            ('view-results', request);

        const tableResponse = axiosResponse.data.data;
        setPages(Math.ceil(tableResponse.count / pageSize));
        setState(lastReq);
        setTableResponse(tableResponse);
        setIsLoading(false);
    }

    const debounceFetch = debounce(500, false, fetchData);

    useEffect(() => {
        if (state) {
            const newState = { ...state };
            newState.filtered = addToFilters(newState.filtered, course, year, problem);
            fetchData(newState);
        }
    }, [course, year, problem, rng]);


    return <>
        <ReactTable filterable manual
            data={tableResponse.data}
            pages={pages}
            loading={isLoading}
            columns={defaultColumns()}
            showPagination={true}
            pageSizeOptions={[5, 10, 15, 20, 50]}
            onFetchData={debounceFetch}
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
                        setGradeResult((data as any)?._original);
                    }
                };
            }}
        />
        {gradeResult && <StudentResultsDialogForTeacher
            onClose={() => setGradeResult(undefined)}
            result={gradeResult}
            onRefresh={refresh}
        />}
    </>
}