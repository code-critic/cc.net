import React, { useEffect, useState } from "react";
import { useUser } from "../hooks/useUser";
import { ICcData } from "../models/DataModel";
import { ProblemPickerExportProps } from "./ProblemPicker";
import ClearIcon from '@material-ui/icons/Clear';
import DoneIcon from '@material-ui/icons/Done';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import PriorityHighIcon from '@material-ui/icons/PriorityHigh';
import { API } from "../api";
import { IApiListResponse } from "../models/CustomModel";
import { SimpleLoader } from "../components/SimpleLoader";
import { Box, Typography, Button, Tooltip } from "@material-ui/core";
import { ProcessStatusCodes } from "../models/Enums";
import { Link as RouterLink } from "react-router-dom";
import { getStatus } from "../utils/StatusUtils";
import TimerIcon from '@material-ui/icons/Timer';
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import CallMissedIcon from '@material-ui/icons/CallMissed';
import GradeIcon from '@material-ui/icons/Grade';

interface SubmitSolutionLastResultsProps extends ProblemPickerExportProps {
}


const IconClass = (result: ICcData) => {
    switch (result.result.status) {
        case ProcessStatusCodes.AnswerCorrect:
        case ProcessStatusCodes.Ok:
            return result.points > 0
                ? DoneAllIcon
                : DoneIcon;

        case ProcessStatusCodes.AnswerCorrectTimeout:
        case ProcessStatusCodes.GlobalTimeout:
            return TimerIcon;

        case ProcessStatusCodes.AnswerWrong:
            return ClearIcon;

        case ProcessStatusCodes.Running:
            return PlayArrowIcon;

        case ProcessStatusCodes.InQueue:
            return HourglassEmptyIcon;

        case ProcessStatusCodes.Skipped:
            return CallMissedIcon;
    }

    return PriorityHighIcon;
}

interface IconTextProps {
    icon: any;
    children: any;
    to: string;
    cls: string;
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

    return (<div>
        {!results.length && <Typography color="textSecondary">
            No results found
        </Typography>}
        <div className="latest-result-wrapper">
            <Box display="flex" className="latest-results">
                {results.length && results.map((i, j) => {
                    const status = getStatus(i.result.status);
                    const IconCls = IconClass(i);

                    return (<Tooltip key={j} title={status.description} enterDelay={0} arrow>
                        <Button component={RouterLink} to={`/r/${i.objectId}`} className={`icon-text-button ${status.name}`}>
                            {i.reviewRequest && <div className="cr marker">
                                <GradeIcon />
                            </div>}
                            <div className="icon"><IconCls /></div>
                            <div className="text">#{i.attempt}</div>
                        </Button>
                    </Tooltip>)
                })}
            </Box>
        </div>
    </div>)
}
