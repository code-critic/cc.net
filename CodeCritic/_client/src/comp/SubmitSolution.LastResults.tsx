import { Box, Button } from "@material-ui/core";
import GradeIcon from '@material-ui/icons/Grade';
import React, { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { API } from "../api";
import { SimpleLoader } from "../components/SimpleLoader";
import { useUser } from "../hooks/useUser";
import { IApiListResponse } from "../models/CustomModel";
import { ICcData } from "../models/DataModel";
import { AbsMoment } from "../renderers/AbsMoment";
import { IconClass } from "../renderers/IconClass";
import { LightTooltip } from "../renderers/LightTooltip";
import { getStatus } from "../utils/StatusUtils";
import { ProblemPickerExportProps } from "./ProblemPicker";
import StarOutlineIcon from '@material-ui/icons/StarOutline';

interface SubmitSolutionLastResultsProps extends ProblemPickerExportProps {
}



export const SubmitSolutionLastResults = (props: SubmitSolutionLastResultsProps) => {
    const { problem } = props;
    const [results, setResults] = useState<ICcData[]>();
    const { user, isRoot, isStudent, canBeRoot, canBeStudent } = useUser();

    useEffect(() => {
        (async () => {
            const url = `user-problem-results/${problem.course}/${problem.year}/${problem.id}/${user.id}`;
            const axiosResponse = await API.get<IApiListResponse<ICcData>>(url);
            const responseData = axiosResponse.data;
            setResults(responseData.data);
        })()
    }, [user.id]);

    if (results == null) {
        return <SimpleLoader title="loading latest results" />
    }
    if (!results.length) {
        return <></>
    }

    return (<div style={{ padding: 8 }}>
        <div className="latest-result-wrapper">
            <Box display="flex" className="latest-results">
                {results.map((i, j) => {
                    const status = getStatus(i.result.status);
                    const IconCls = IconClass(i);
                    const canEditResult = (user.id == i.user && i.isActive && i.points <= 0);
                    const statusDesc = <>
                        <strong>{status.description}</strong>
                        <br />
                        <strong>Submission date: </strong><AbsMoment date={i.id.creationTime} noTooltip />
                        {i.reviewRequest && <>
                            <br />
                            <strong>Review requested: </strong><AbsMoment date={i.id.creationTime} noTooltip />
                        </>}
                    </>;
                    const starDesc = <>
                        {canEditResult
                            ? (!i.reviewRequest
                                ? "Click to send Review Request"
                                : "Click to take back Review Request")
                            : "Cannot change Review Request"}
                    </>

                    return (<div key={j} className={`icon-text-button-wrapper ${status.name}`}>
                        <LightTooltip title={starDesc} enterDelay={0}>
                            <span>
                                <Button fullWidth disabled={!canEditResult} className={`${i.reviewRequest ? "cr has-cr" : "cr"}`}>
                                    {i.reviewRequest ? <GradeIcon /> : <StarOutlineIcon />}
                                </Button>
                            </span>
                        </LightTooltip>

                        <LightTooltip title={statusDesc} enterDelay={0}>
                            <Button component={RouterLink} to={`/r/${i.objectId}`} className={`icon-text-button`}>
                                <div className="icon"><IconCls /></div>
                                <div className="text">#{i.attempt}</div>
                            </Button>
                        </LightTooltip>
                    </div>)
                })}
            </Box>
        </div>
    </div>)
}
