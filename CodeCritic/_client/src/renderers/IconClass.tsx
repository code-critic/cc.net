import CallMissedIcon from '@material-ui/icons/CallMissed';
import ClearIcon from '@material-ui/icons/Clear';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import DoneIcon from '@material-ui/icons/Done';
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PriorityHighIcon from '@material-ui/icons/PriorityHigh';
import TimerIcon from '@material-ui/icons/Timer';
import { ICcData, ICcDataCaseResult } from '../models/DataModel';
import { ProcessStatusCodes } from '../models/Enums';


export const IconClassGeneric = (status: number, points: number) => {
    switch (status) {
        case ProcessStatusCodes.AnswerCorrect:
        case ProcessStatusCodes.Ok:
            return points > 0
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

export const IconClass = (result: ICcData) => {
    return IconClassGeneric(result.result.status, result.points);
}

export const IconClassSubresult = (subresult: ICcDataCaseResult) => {
    switch (subresult.status) {
        case ProcessStatusCodes.AnswerCorrect:
        case ProcessStatusCodes.Ok:
            return DoneIcon;

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
