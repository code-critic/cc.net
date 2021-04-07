import { Button, IconButton } from "@material-ui/core";
import { useEffect, useState } from "react";
import { API } from "../../api";
import { SimpleLoader } from "../../components/SimpleLoader";
import { IApiListResponse } from "../../models/CustomModel";
import { ICcData, ICcDataLight } from "../../models/DataModel"
import { AbsMoment } from "../../renderers/AbsMoment";
import { LightTooltip } from "../../renderers/LightTooltip";
import { getStatus } from "../../utils/StatusUtils";

interface PreviousResultsProps {
    result: ICcData;
    selectedResultId: string;
    onChange(objectId: string);
}
export const PreviousResults = (props: PreviousResultsProps) => {
    const { result, selectedResultId, onChange } = props;
    const [results, setResults] = useState<ICcDataLight[]>();

    useEffect(() => {
        (async () => {
            const author = result.userOrGroupUsers[0]
            const url = `user-problem-results-light/${result.courseName}/${result.courseYear}/${result.problem}/${author}`;
            const axiosResponse = await API.get<IApiListResponse<ICcDataLight>>(url);
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