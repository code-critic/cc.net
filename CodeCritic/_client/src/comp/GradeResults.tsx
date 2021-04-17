import React, { useEffect, useState } from 'react';

import { Dialog, DialogContent } from '@material-ui/core';
import InsertChartIcon from '@material-ui/icons/InsertChart';

import { CodeCritic } from '../api';
import { ICcDataDto, ITableResponse } from '../cc-api';
import { SimpleLoader } from '../components/SimpleLoader';
import { useRefresh } from '../hooks/useRefresh';
import { ProcessStatusStatic } from '../models/Enums';
import { notifications } from '../utils/notifications';
import { ProblemPicker, ProblemPickerExportProps } from './ProblemPicker';
import { SolutionResultView } from './solutionResultView/SolutionResultView';
import { TableResults } from './table/TableResults';

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

interface GraderesultsImplProps extends ProblemPickerExportProps { }
const GraderesultsImpl = (props: GraderesultsImplProps) => {
    const { course, problem } = props;
    const { counter, refresh } = useRefresh();
    const [ data, setData ] = useState<ICcDataDto[]>();
    const [selectedItem, setSelectedItem] = useState<ICcDataDto>();

    useEffect(() => {
        (async () => {
            const axiosResponse = await CodeCritic.api.gradeStatsDetail(course.course, course.year, problem.id);
            const data = axiosResponse.data.map(i => i.result);
            setData(data);
        })();
    }, [ counter ]);

    if (data == null) {
        return <SimpleLoader title="loading stats" />
    }

    const tableResponse: ITableResponse = {
        data, count: data.length
    };

    const handleSelected = async (item: ICcDataDto) => {
        if(item.status === ProcessStatusStatic.NoSolution.letter) {
            notifications.warning("Cannot open the solution", "Solution is virtual and does not exists");
        } else {
            setSelectedItem(item);
        }
    }

    return (<>
    <TableResults
        isLoading={false}
        onChange={refresh}
        onSelected={handleSelected}
        tableResponse={tableResponse}
        mode="client"
        allowKeyboardShortcuts={selectedItem == null}
    />
        {selectedItem && <>
            <Dialog className="solution-result-view-dialog"
                    open={!!selectedItem}
                    onClose={() => setSelectedItem(undefined)}
                    fullWidth maxWidth="lg">
                <DialogContent>
                    <SolutionResultView onClose={() => setSelectedItem(undefined)} onChange={refresh} objectId={selectedItem.objectId} />
                </DialogContent>
            </Dialog>
        </>}
    </>);
}