import { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { Dialog, DialogContent } from '@material-ui/core';
import AssignmentIndIcon from '@material-ui/icons/AssignmentInd';

import { API } from '../api';
import { useRefresh } from '../hooks/useRefresh';
import { IApiResponse } from '../models/CustomModel';
import {
    ICcData, ICcDataDto, ICcDataResult, ITableRequest, ITableRequestFilter, ITableResponse,
} from '../models/DataModel';
import { ProblemPicker, ProblemPickerExportProps } from './ProblemPicker';
import { getStatusOrDefault } from './result.columns';
import { SolutionResultView } from './solutionResultView/SolutionResultView';
import { TableModel, TableResults } from './table/TableResults';
import { createTableRequest } from './table/TableResults.request';

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
    const { course, year, problem } = useParams<any>();
    const [tableResponse, setTableResponse] = useState<ITableResponse>({ count: 0, data: [] });
    const [gradeResult, setGradeResult] = useState<ICcData>();
    const [tableModel, setTableModel] = useState<TableModel>();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ICcDataDto>();
    const { counter, refresh } = useRefresh();


    const fetchData = async () => {
        setIsLoading(true);
        const request = createTableRequest(tableModel, course, year, problem);
        const axiosResponse = await API.post<ITableRequest, AxiosResponse<IApiResponse<ITableResponse>>>
            ('view-results', request);

        const tableResponse = axiosResponse.data.data;
        setTableResponse(tableResponse);
        setIsLoading(false);
    }


    useEffect(() => {
        fetchData();
    }, [course, year, problem, tableModel]);

    const handleHandle = async (model: TableModel) => {
        setTableModel(model);
    }

    const handleSelected = async (item: ICcDataDto) => {
        setSelectedItem(item);
    }

    return (<>
        <TableResults
            debounceDuration={100}
            tableResponse={tableResponse}
            onChange={handleHandle}
            onSelected={handleSelected}
            isLoading={isLoading} />
        {selectedItem && <>
            <Dialog open={!!selectedItem} onClose={() => setSelectedItem(undefined)} fullWidth maxWidth="lg">
                <DialogContent>
                    <SolutionResultView onClose={() => setSelectedItem(undefined)} onChange={fetchData} objectId={selectedItem.objectId} />
                </DialogContent>
            </Dialog>
        </>}
    </>);
}
