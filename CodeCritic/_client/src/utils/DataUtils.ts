import { ICcData, ICourse, ISingleCourse, ICourseYearConfig } from "../models/DataModel";

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

function toSingleCourse(i: ICourse, j: ICourseYearConfig): ISingleCourse {
    return { course: i.name, year: j.year, problems: j.problems, courseConfig: i.courseConfig, courseRef: i, settingsConfig: undefined as any };
}

export function flattenCourses(courses: ICourse[]): ISingleCourse[] {
    return courses
        .flatMap(i => i.courseYears.map(j => toSingleCourse(i, j)));
}

export function flattenCourse(i: ICourse): ISingleCourse[] {
    return i.courseYears.map(j => toSingleCourse(i, j));
}