import { ProcessStatusCodes, ProcessStatusStatic } from "../models/Enums"

export const isStatusOk = (status: number) => {
    if (status === ProcessStatusCodes.AnswerCorrect
        || status === ProcessStatusCodes.AnswerCorrectTimeout
        || status === ProcessStatusCodes.Ok) {
            return 1;
    } else if (status === ProcessStatusCodes.Running) {
        return 2;
    }
    return 0;
}

export const getStatus = (status: number) => {
    var result = ProcessStatusStatic.All.find(i => i.value === status)
    return !result ? ProcessStatusStatic.ErrorWhileRunning : result;
}