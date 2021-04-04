import { Box, Button, Dialog, DialogContent, Typography } from "@material-ui/core";
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
import { cancelCodeReview, requestCodeReview } from "../utils/api";
import { useRefresh } from "../hooks/useRefresh";
import { SolutionResultView } from "./solutionResultView/SolutionResultView";
import { ProcessStatusStatic } from "../models/Enums";
import { TimelineRenderer } from "../renderers/TimelineRenderer";

interface SubmitSolutionLastResultsProps extends ProblemPickerExportProps {
    liveResult: ICcData;
}
export const SubmitSolutionLastResults = (props: SubmitSolutionLastResultsProps) => {
    const { problem, liveResult } = props;
    const [results, setResults] = useState<ICcData[]>();
    const [selectedItem, setSelectedItem] = useState<string>();
    const { user, isRoot, isStudent, canBeRoot, canBeStudent } = useUser();
    const { counter, refresh } = useRefresh();

    useEffect(() => {
        (async () => {
            const url = `user-problem-results/${problem.course}/${problem.year}/${problem.id}/${user.id}`;
            const axiosResponse = await API.get<IApiListResponse<ICcData>>(url);
            const responseData = axiosResponse.data;
            setResults(responseData.data);
        })()
    }, [user.id, counter]);

    const handleClickReview = async (result: ICcData) => {
        if (result.reviewRequest) {
            await cancelCodeReview(result);
        } else {
            await requestCodeReview(result);
        }
        refresh();
    }

    const handleClick = (e: React.MouseEvent<any>, objectId: string) => {
        if (e.button === 0) {
            e.stopPropagation();
            e.preventDefault();
            setSelectedItem(objectId);
        }
    }

    if (results == null) {
        return <SimpleLoader title="loading latest results" />
    }

    const fromServer = results.find(i => i.objectId === liveResult?.objectId);
    const hybrid = liveResult == null
        ? null
        : { ...liveResult,
            reviewRequest: fromServer?.reviewRequest ?? liveResult.reviewRequest,
            points: fromServer?.points ?? liveResult.points,
        };

    const allResults = hybrid == null
        ? results
        : [hybrid, ...results.filter(i => i.objectId !== liveResult.objectId)];
    
    if (allResults.length === 0) {
        return <></>
    }

    return (<div>
        <div className="latest-result-wrapper">
            <Typography variant="h6">Submission history</Typography>
            <Box display="flex" className="latest-results">
                {allResults.map((i, j) => {
                    const status = getStatus(i.result.status);
                    const IconCls = IconClass(i);
                    
                    const canEditResult = (user.id == i.user && i.points <= 0) || isRoot;
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
                    const isLive = i.objectId === liveResult?.objectId;

                    return (<div key={j} className={`icon-text-button-wrapper ${status.name} ${isLive ? "live" : ""}`}>
                        <LightTooltip title={starDesc} enterDelay={0}>
                            <span className="star">
                                <Button fullWidth disabled={!canEditResult} onClick={() => handleClickReview(i)}
                                    className={`${i.reviewRequest ? "cr has-cr" : "cr"}`}>
                                    {i.reviewRequest ? <GradeIcon /> : <StarOutlineIcon />}
                                </Button>
                            </span>
                        </LightTooltip>

                        <LightTooltip title={statusDesc} enterDelay={0}>
                            <Button onClick={e => handleClick(e, i.objectId)}
                                component={RouterLink} to={`/r/${i.objectId}`}
                                className={`icon-text-button`}>
                                <div className="icon"><IconCls /></div>
                                <div className="text">
                                    <span className="pts">#{i.attempt}</span>
                                    {i.reviewRequest != null && <span className="pts">{i.points} pts</span>}
                                </div>
                            </Button>
                        </LightTooltip>
                        {isLive && <div className="live-result">
                                <div>
                                    Status: <strong>
                                        {ProcessStatusStatic.All.find(k => k.code === liveResult.result.status)?.name}
                                    </strong>
                                </div>
                                <div>
                                    <TimelineRenderer result={liveResult} showExtra={isRoot} miniMode />
                                </div>
                        </div>}
                    </div>)
                })}
            </Box>
        </div>
        {
            selectedItem && <>
                <Dialog className="solution-result-view-dialog"
                    open={!!selectedItem}
                    onClose={() => setSelectedItem(undefined)}
                    fullWidth maxWidth="lg">
                    <DialogContent>
                        <SolutionResultView onClose={() => setSelectedItem(undefined)} onChange={refresh} objectId={selectedItem} />
                    </DialogContent>
                </Dialog>
            </>
        }
    </div>)
}
