import React, { useEffect, useState } from 'react';

import { IconButton } from '@material-ui/core';

import { CodeCritic } from '../../api';
import { ICcData, ICcDataLight } from '../../cc-api';
import { SimpleLoader } from '../../components/SimpleLoader';
import { AbsMoment } from '../../renderers/AbsMoment';
import { LightTooltip } from '../../renderers/LightTooltip';
import { getStatus } from '../../utils/StatusUtils';

interface PreviousResultsProps {
    result: ICcData;
    selectedResultId: string;
    onChange(objectId: string): void;
}
export const PreviousResults = (props: PreviousResultsProps) => {
    const { result, selectedResultId, onChange } = props;
    const [results, setResults] = useState<ICcDataLight[]>();

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

    return (<div className="previous-results">
        {results.map((i, j) =>
            <span key={i.objectId}>
                <PreviousResult onClick={() => onChange(i.objectId)} result={i} selected={selectedResultId === i.objectId} />
                {j != (results.length - 1) && <span className="connector" />}
            </span>
        )}
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