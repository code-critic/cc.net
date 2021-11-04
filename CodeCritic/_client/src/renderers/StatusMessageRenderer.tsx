import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import PanToolIcon from '@mui/icons-material/PanTool';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import TimerIcon from '@mui/icons-material/Timer';
import Alert from '@mui/material/Alert';
import React from "react";
import Moment from "react-moment";
import { ICourseProblem } from "../cc-api";
import { ProblemStatus } from "../models/Enums";

interface StatusMessageProps {
    problem: ICourseProblem;
}

export const AlertStatusMessage = (props: StatusMessageProps) => {
    const { problem } = props;
    const { statusCode } = problem as any;

    if (statusCode == ProblemStatus.BeforeStart) {
        return <Alert severity="info" icon={<TimerIcon />}>
            &nbsp;Submission is not yet open.
            It will be <Moment date={problem.since} fromNow />
        </Alert>
    }
    if (statusCode == ProblemStatus.Active) {
        return <Alert severity="success" icon={<ThumbUpAltIcon />}>
            Submission is open.
            It'll be closed <Moment date={problem.avail} fromNow/>.
        </Alert>
    }

    if (statusCode == ProblemStatus.ActiveLate) {
        return <Alert severity="warning" icon={<ErrorOutlineIcon />}>
            Submission is open but it's after the deadline
        </Alert>
    }

    if (statusCode == ProblemStatus.AfterDeadline) {
        return <Alert severity="error" icon={<PanToolIcon />}>
            &nbsp;Submission is closed
        </Alert>
    }

    return <>
    </>
}

export const StatusMessage = (props: StatusMessageProps) => {
    const { problem } = props;
    const { statusCode } = problem as any;

    if (statusCode == ProblemStatus.BeforeStart) {
        return <span>
            <TimerIcon style={{ color: "#3f51b5" }} fontSize="small" />
            &nbsp;Submission is not yet open.
            It will be <Moment date={problem.since} fromNow/>
        </span>
    }
    if (statusCode == ProblemStatus.Active) {
        return <span>
            <ThumbUpAltIcon style={{ color: "#969696" }} fontSize="small" />
            &nbsp;Submission is open.
            It'll be closed <Moment date={problem.avail} fromNow/>.
        </span>
    }

    if (statusCode == ProblemStatus.ActiveLate) {
        return <span>
            <ErrorOutlineIcon style={{ color: "#ad6800" }} fontSize="small" />
            &nbsp;Submission is open but it's after the deadline
        </span>
    }

    if (statusCode == ProblemStatus.AfterDeadline) {
        return <span><PanToolIcon style={{ color: "#ad0000" }} fontSize="small" />
            &nbsp;Submission is closed
        </span>
    }

    return <>
    </>
}