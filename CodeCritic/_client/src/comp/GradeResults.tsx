import React, { createContext, useContext, useEffect, useState } from 'react';

import { Checkbox, Dialog, DialogContent, FormControlLabel } from '@mui/material';
import InsertChartIcon from '@mui/icons-material/InsertChart';

import { CodeCritic } from '../api';
import { ICcDataDto, IGradeStatFilterDto, ITableResponse } from '../cc-api';
import { SimpleLoader } from '../components/SimpleLoader';
import { useRefresh } from '../hooks/useRefresh';
import { useUser } from '../hooks/useUser';
import { ProcessStatusStatic } from '../models/Enums';
import { notifications } from '../utils/notifications';
import { ProblemPicker, ProblemPickerExportProps } from './ProblemPicker';
import { SolutionResultView } from './solutionResultView/SolutionResultView';
import { TableResults } from './table/TableResults';


interface IGradeStatFilterContext {
    context: IGradeStatFilterDto,
    setContext?(value: any): void,
}
const GradeStatFilterContext: IGradeStatFilterContext = {
    context: { showMissingGradeOnly: false },
};
const FilterContext = createContext<any>(GradeStatFilterContext);

const CustomBreadcrumbRenderer = (props: ProblemPickerExportProps) => {
    const { course, problem } = props;
    const { context, setContext } = useContext(FilterContext) as IGradeStatFilterContext;

    if (!course || !problem) {
        return <></>
    }

    const handleChange = () => {
        setContext({ showMissingGradeOnly: !context.showMissingGradeOnly})
    }
    return <div>
        <FormControlLabel
            control={<Checkbox 
                color="primary"
                checked={context.showMissingGradeOnly} 
                onChange={handleChange} title="missing grade only" />}
            label="missing grade only"
            />
    </div>
}

export const Graderesults = () => {
    const [context, setContext] = useState(GradeStatFilterContext.context);

    return <div>
        <FilterContext.Provider value={{ context, setContext }} >
            <ProblemPicker
                baseUrl="/grade-results"
                home={<><InsertChartIcon />Grade</>}
                component={GraderesultsImpl}
                withBreadcrumbs={CustomBreadcrumbRenderer}
                whereUserIsTeacher
            />
        </ FilterContext.Provider>
    </div>
}

interface GraderesultsImplProps extends ProblemPickerExportProps { }
const GraderesultsImpl = (props: GraderesultsImplProps) => {
    const { course, problem } = props;
    const { counter, refresh } = useRefresh();
    const [ data, setData ] = useState<ICcDataDto[]>();
    const [ selectedItem, setSelectedItem ] = useState<ICcDataDto>();
    const [ selectedIndex, setSelectedIndex ] = useState(-1);

    const { context } = useContext(FilterContext) as IGradeStatFilterContext;
    const { isRoot } = useUser();

    useEffect(() => {
        (async () => {
            const axiosResponse = await CodeCritic.api.gradeStatsCreate(course.course, course.year, problem.id, context);
            const data = axiosResponse.data.map(i => i.result);
            setData(data);
        })();
    }, [counter, context.showMissingGradeOnly ]);

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
            setSelectedIndex((tableResponse.data || []).findIndex(i => i.objectId === item.objectId));
        }
    }

    const nextPage = async () => {
        if (selectedItem) {
            const index = (tableResponse.data || []).findIndex(i => i.objectId === selectedItem.objectId);
            const newItem = (tableResponse.data || []).find((i, j) => j > index && i.status !== ProcessStatusStatic.NoSolution.letter);

            if (newItem) {
                await handleSelected(newItem);
            }
        }
    }

    const prevPage = async () => {
        if (selectedItem) {
            const reversed = (tableResponse.data || []).slice().reverse();

            const index = reversed.findIndex(i => i.objectId === selectedItem.objectId);
            const newItem = reversed.find((i, j) => j > index && i.status !== ProcessStatusStatic.NoSolution.letter);

            if (newItem) {
                await handleSelected(newItem);
            }
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
                    {isRoot && 
                        <div>{selectedIndex + 1} / {tableResponse?.data?.length ?? 666}</div>
                    }
                    <SolutionResultView
                        onClose={() => setSelectedItem(undefined)}
                        onChange={refresh}
                        objectId={selectedItem.objectId}
                        nextPage={nextPage}
                        prevPage={prevPage}
                        />
                </DialogContent>
            </Dialog>
        </>}
    </>);
}