import React, { useEffect, useState } from 'react';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography } from '@material-ui/core';

import { CodeCritic } from '../../api';
import { ICcData, ICcDataLight, IPlagResult } from '../../cc-api';
import { SimpleLoader } from '../../components/SimpleLoader';
import { AbsMoment } from '../../renderers/AbsMoment';
import { LightTooltip } from '../../renderers/LightTooltip';
import { getStatus } from '../../utils/StatusUtils';
import { DropDownMenu } from '../../components/DropDownMenu';
import { RenderDiffTable } from '../../renderers/RenderDiffTable';
import PolicyIcon from '@material-ui/icons/Policy';
import { nextIndex, prevIndex } from '../../utils/arrayUtils';


interface PreviousResultsProps {
    result: ICcData;
    selectedResultId: string;
    onChange(objectId: string): void;
}
export const PreviousResults = (props: PreviousResultsProps) => {
    const { result, selectedResultId, onChange } = props;
    const [results, setResults] = useState<ICcDataLight[]>();
    const [selectedDiff, setSelectedDiff] = useState<IPlagResult>();
    

    const nextSelectedItem = () => {
        const [change,, item] = nextIndex(results, selectedDiff.bId);
        if (change && item.objectId != selectedResultId) {
            compareResults(item.objectId);
        }
    }

    const prevSelectedItem = () => {
        const [change,, item] = prevIndex(results, selectedDiff.bId);
        if (change && item.objectId != selectedResultId) {
            compareResults(item.objectId);
        }
    }

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (selectedDiff && results?.length > 1) {
                if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                    e.preventDefault();
                    nextSelectedItem();
                } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                    e.preventDefault();
                    prevSelectedItem();
                }
            }
        }
        window.addEventListener("keydown", handleKeyPress);

        return () => {
            window.removeEventListener("keydown", handleKeyPress);
        }
    }, [ selectedDiff?.aId, selectedDiff?.bId ]);


    useEffect(() => {
        (async () => {
            const author = result.userOrGroupUsers[0];
            const axiosResponse = await CodeCritic.api.userProblemResultsLightDetail(
                result.courseName, result.courseYear, result.problem, author
            );
            const responseData = axiosResponse.data;
            setResults(responseData.data);
        })();
    }, []);

    if (!results) {
        return <SimpleLoader />
    }

    const onClose = () => {
        setSelectedDiff(undefined);
    }

    const compareResults = async (b: string) => {
        const a = selectedResultId;
        const response = await CodeCritic.api.plagTwoDetail(a, b);
        setSelectedDiff(response.data);
    }


    return (<div className="previous-results">
        {results.map((i, j) =>
            <span key={i.objectId}>
                <PreviousResult onClick={() => onChange(i.objectId)} result={i} selected={selectedResultId === i.objectId} />
                {j != (results.length - 1) && <span className="connector" />}
            </span>
        )}
        <DropDownMenu
            buttonProps={{variant: "contained", color: "secondary", className: "small"}}
            title={<>Compare
                <PolicyIcon />
            </>} options={results} 
            getIsDisabled={i => i.objectId == selectedResultId}
            getLabel={i => `Compare with #${i.attempt}`}
            onChange={i => compareResults(i.objectId)} />

        {selectedDiff && <Dialog open onClose={onClose} fullScreen>
            <DialogTitle>
                {selectedDiff.aName} vs {selectedDiff.bName}
                <Typography variant="subtitle1">Use arrows to walk through submission history</Typography>
                </DialogTitle>
            <DialogContent>
                {selectedDiff.diffs.map((k, l) => <div key={l}>
                    <RenderDiffTable syntax={selectedDiff.language} item={k} />
                </div>)}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>}
    </div>)
}

interface PreviousResultProps {
    result: ICcDataLight;
    selected: boolean;
    onClick(): void;
}

const PreviousResult = (props: PreviousResultProps) => {
    const { result, selected, onClick } = props;
    const status = getStatus(result.status);
    const rr = result.reviewRequest != null;

    return <LightTooltip title={<AbsMoment noTooltip date={result.id.creationTime} />}>
        <IconButton onClick={onClick}
            className={`dot ${selected ? "selected" : ""} ${status.name} ${rr ? "rr" : ""}`}>
            {result.attempt}
        </IconButton>
    </LightTooltip>
}