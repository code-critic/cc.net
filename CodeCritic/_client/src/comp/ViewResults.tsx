import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { Dialog, DialogContent } from '@material-ui/core';
import AssignmentIndIcon from '@material-ui/icons/AssignmentInd';

import { CodeCritic } from '../api';
import { ICcDataDto, ITableResponse } from '../cc-api';
import { notifications } from '../utils/notifications';
import { ProblemPicker, ProblemPickerExportProps } from './ProblemPicker';
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

interface ViewResultsImplProps extends Partial<ProblemPickerExportProps> { }
const ViewResultsImpl = (props: ViewResultsImplProps) => {
    const { course, year, problem } = useParams<any>();
    const [tableResponse, setTableResponse] = useState<ITableResponse>({ count: 0, data: [] });
    const [tableModel, setTableModel] = useState<TableModel>();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ICcDataDto>();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const hasCtrl = e.ctrlKey || true;
            if (selectedItem != null) {
                if (hasCtrl && (e.key === "ArrowRight" || e.key === "ArrowDown")) {
                    e.preventDefault();
                    nextSelectedItem();
                } else if (hasCtrl && (e.key === "ArrowLeft" || e.key === "ArrowUp")) {
                    e.preventDefault();
                    prevSelectedItem();
                }
            }
        }

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        }
    }, [ selectedItem?.objectId ]);



    useEffect(() => {
        fetchData();
    }, [course, year, problem, tableModel]);

    const nextSelectedItem = () => {
        if (selectedItem != null && tableResponse != null) {
            const items = tableResponse.data ?? [ ];
            const idx = items.findIndex(i => i.objectId === selectedItem.objectId) ?? -1;
            if (idx !== -1 && idx < items.length-1) {
                setSelectedItem(items[idx+1]);
                notifications.info(`${idx + 1 + 1} / ${items.length}`, "", 700);
            }
        }
    }

    const prevSelectedItem = () => {
        if (selectedItem != null && tableResponse != null) {
            const items = tableResponse.data ?? [ ];
            const idx = items.findIndex(i => i.objectId === selectedItem.objectId) ?? -1;
            if (idx !== -1 && idx > 0) {
                setSelectedItem(items[idx-1]);
                notifications.info(`${idx + 1 - 1} / ${items.length}`, "", 700);
            }
        }
    }


    const fetchData = async () => {
        setIsLoading(true);
        const request = createTableRequest(tableModel, course, year, problem);
        const axiosResponse = await CodeCritic.api.viewResultsCreate(request);

        const tableResponse = axiosResponse.data.data;
        setTableResponse(tableResponse);
        setIsLoading(false);
    }


    const handleHandle = (model: TableModel) => {
        setTableModel(model);
    }

    const handleSelected = (item: ICcDataDto) => {
        setSelectedItem(item);
    }

    return (<>
        <TableResults
            debounceDuration={100}
            tableResponse={tableResponse}
            onChange={handleHandle}
            onSelected={handleSelected}
            isLoading={isLoading}
            allowKeyboardShortcuts={selectedItem == null}/>
            
        {selectedItem && <>
            <Dialog className="solution-result-view-dialog"
                    open={!!selectedItem} 
                    onClose={() => setSelectedItem(undefined)} 
                    fullWidth maxWidth="lg">
                <DialogContent>
                    <SolutionResultView onClose={() => setSelectedItem(undefined)} onChange={fetchData} objectId={selectedItem.objectId} />
                </DialogContent>
            </Dialog>
        </>}
    </>);
}
