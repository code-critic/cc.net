import CallMissedIcon from '@mui/icons-material/CallMissed';
import ClearIcon from '@mui/icons-material/Clear';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import DoneIcon from '@mui/icons-material/Done';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import TimerIcon from '@mui/icons-material/Timer';
import { ICcData, ICcDataCaseResult } from '../cc-api';
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
