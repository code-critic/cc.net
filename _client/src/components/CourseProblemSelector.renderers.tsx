import React, { useEffect } from "react";
import { ICourseProblem } from "../models/DataModel";
import { ProblemStatus } from "../models/Enums";
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import TimerIcon from '@material-ui/icons/Timer';
import ThumbUpAltIcon from '@material-ui/icons/ThumbUpAlt';
import PanToolIcon from '@material-ui/icons/PanTool';
import Moment from "react-moment";
import Alert from '@material-ui/lab/Alert';

interface StatusMessageProps {
    problem: ICourseProblem;
}

export const AlertStatusMessage = (props: StatusMessageProps) => {
    const { problem } = props;
    const { statusCode } = problem as any;

    if (statusCode == ProblemStatus.BeforeStart) {
        return <Alert severity="info" icon={<TimerIcon />}>
            &nbsp;Submission is not yet open.
            It will be in <Moment date={problem.since} fromNow />
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
            It will be in <Moment date={problem.since} fromNow/>
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