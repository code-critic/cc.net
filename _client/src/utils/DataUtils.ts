import { ICcData } from "../models/DataModel";

export function getPoints(data: ICcData, defaultValue: number=0) {
    if (!data) {
        return 0;
    }
    if(data.points === null || data.points == undefined) {
        if (data.result) {
            return getDefaultPoints(data, defaultValue);
        } else {
            return defaultValue;
        }
    } else {
        return data.points;
    }
}

export function getDefaultPoints(data: ICcData, defaultValue: number=0): number {
    if(!data || !data.result || !data.result.scores || !data.result.scores.length) {
        return defaultValue;
    }
    return data.result.scores[0] * 10 + data.result.scores[1];
}