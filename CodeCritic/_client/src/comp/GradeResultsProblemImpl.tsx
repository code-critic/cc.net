import React, { useContext, useEffect, useState } from 'react';
import { Checkbox, Dialog, DialogContent, FormControlLabel } from '@material-ui/core';
import { CodeCritic } from '../api';
import { ICcDataDto, IGradeDto, ITableResponse } from '../cc-api';
import { SimpleLoader } from '../components/SimpleLoader';
import { useRefresh } from '../hooks/useRefresh';
import { useUser } from '../hooks/useUser';
import { ProcessStatusStatic } from '../models/Enums';
import { notifications } from '../utils/notifications';
import { ProblemPickerExportProps } from './ProblemPicker';
import { SolutionResultView } from './solutionResultView/SolutionResultView';
import { TableResults } from './table/TableResults';
import { FilterContext, IGradeStatFilterContext } from './GradeResults';


const applyTagsFilter = (data: IGradeDto[], tags: string[]) => {
    if (tags.length === 0) {
        return data;
    }

    return data.filter(d => {
        const intersection = d.user.tags!.filter(t => tags.includes(t));
        return intersection.length > 0;
    });
}


interface GradeResultsProblemImplProps extends ProblemPickerExportProps { }
export const GradeResultsProblemImpl = (props: GradeResultsProblemImplProps) => {
    const { course, problem } = props;
    const { counter, refresh } = useRefresh();
    const [data, setData] = useState<IGradeDto[]>();
    const [selectedItem, setSelectedItem] = useState<ICcDataDto>();
    const [selectedIndex, setSelectedIndex] = useState(-1);

    // tags state
    const [tags, setTags] = useState<string[]>([]);

    const { context } = useContext(FilterContext) as IGradeStatFilterContext;
    const { isRoot } = useUser();

    useEffect(() => {
        (async () => {
            const axiosResponse = await CodeCritic.api.gradeStatsCreate(course.course, course.year, problem.id, context);
            const data = axiosResponse.data;
            setData(data);
        })();
    }, [counter, context.showMissingGradeOnly]);

    if (data == null) {
        return <SimpleLoader title="loading stats" />;
    }


    const renderTags = () => {
        const allTags = [...new Set(data.map(i => i.user.tags).flat())].sort();
        return <>{allTags.map(i => <FormControlLabel
            control={<Checkbox
                checked={tags.includes(i)}
                onChange={(e) => {
                    setTags(e.target.checked ? [...tags, i] : tags.filter(t => t !== i));
                }}
            />
            }
            label={i}
            key={i}
            className="tag" />)}</>
    }

    const results = applyTagsFilter(data, tags).map(i => i.result);

    const tableResponse: ITableResponse = {
        data: results, count: results.length
    };

    const handleSelected = async (item: ICcDataDto) => {
        if (item.status === ProcessStatusStatic.NoSolution.letter) {
            notifications.warning("Cannot open the solution", "Solution is virtual and does not exists");
        } else {
            setSelectedItem(item);
            setSelectedIndex((tableResponse.data || []).findIndex(i => i.objectId === item.objectId));
        }
    };

    const nextPage = async () => {
        if (selectedItem) {
            const index = (tableResponse.data || []).findIndex(i => i.objectId === selectedItem.objectId);
            const newItem = (tableResponse.data || []).find((i, j) => j > index && i.status !== ProcessStatusStatic.NoSolution.letter);

            if (newItem) {
                await handleSelected(newItem);
            }
        }
    };

    const prevPage = async () => {
        if (selectedItem) {
            const reversed = (tableResponse.data || []).slice().reverse();

            const index = reversed.findIndex(i => i.objectId === selectedItem.objectId);
            const newItem = reversed.find((i, j) => j > index && i.status !== ProcessStatusStatic.NoSolution.letter);

            if (newItem) {
                await handleSelected(newItem);
            }
        }
    };

    return (<>
        {renderTags()}
        <TableResults
            isLoading={false}
            onChange={refresh}
            onSelected={handleSelected}
            tableResponse={tableResponse}
            mode="client"
            allowKeyboardShortcuts={selectedItem == null} />
        {selectedItem && <>
            <Dialog className="solution-result-view-dialog"
                open={!!selectedItem}
                onClose={() => setSelectedItem(undefined)}
                fullWidth maxWidth="lg">
                <DialogContent>
                    {isRoot &&
                        <div>{selectedIndex + 1} / {tableResponse?.data?.length ?? 666}</div>}
                    <SolutionResultView
                        onClose={() => setSelectedItem(undefined)}
                        onChange={refresh}
                        objectId={selectedItem.objectId}
                        nextPage={nextPage}
                        prevPage={prevPage} />
                </DialogContent>
            </Dialog>
        </>}
    </>);
};
