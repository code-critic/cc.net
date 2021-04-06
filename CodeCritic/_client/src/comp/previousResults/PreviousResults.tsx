import { Button, IconButton } from "@material-ui/core";
import { useEffect, useState } from "react";
import { API } from "../../api";
import { SimpleLoader } from "../../components/SimpleLoader";
import { IApiListResponse } from "../../models/CustomModel";
import { ICcData } from "../../models/DataModel"
import { AbsMoment } from "../../renderers/AbsMoment";
import { LightTooltip } from "../../renderers/LightTooltip";
import { getStatus } from "../../utils/StatusUtils";

interface PreviousResultsProps {
    result: ICcData;
    selectedResult: ICcData;
    onChange(item: ICcData);
}
export const PreviousResults = (props: PreviousResultsProps) => {
    const { result, selectedResult, onChange } = props;
    const [results, setResults] = useState<ICcData[]>();

    useEffect(() => {
        (async () => {
            const author = result.userOrGroupUsers[0]
            const url = `user-problem-results/${result.courseName}/${result.courseYear}/${result.problem}/${author}`;
            const axiosResponse = await API.get<IApiListResponse<ICcData>>(url);
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
                <PreviousResult onClick={() => onChange(i)} result={i} selected={selectedResult.objectId === i.objectId} />
                {j != (results.length - 1) && <span className="connector" />}
            </span>
        )}
    </div>)
}

interface PreviousResultProps {
    result: ICcData;
    selected: boolean;
    onClick(): void;
}

const PreviousResult = (props: PreviousResultProps) => {
    const { result, selected, onClick } = props;
    const status = getStatus(result.result.status);
    const rr = result.reviewRequest != null;

    return <LightTooltip title={<AbsMoment noTooltip date={result.id.creationTime} />}>
        <IconButton onClick={onClick}
        className={`dot ${selected ? "selected" : ""} ${status.name} ${rr ? "rr" : ""}`}>
        {result.attempt}
    </IconButton>
    </LightTooltip>
}