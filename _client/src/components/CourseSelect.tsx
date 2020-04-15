import React from "react";
import { Link } from "react-router-dom";
import { ICourse, ICourseYearConfig, ISingleCourse } from "../models/DataModel";
import { flattenCourse } from "../utils/DataUtils";




export function CourseSelectDefaultTitle(i: ISingleCourse) {
    return <>
        <strong>{i.course}-{i.year}</strong>&nbsp;
        <small>({i.problems.length} problems available)</small>
    </>;
}

export const CourseSelect = (
    courses: ICourse[],
    link: (item: ISingleCourse) => string,
    onClick?: (item: ISingleCourse) => void,
    title: (item: ISingleCourse) => JSX.Element = CourseSelectDefaultTitle,
    ) => {
    return <ul>
    {
            courses
                .flatMap(flattenCourse)
                .map(i =>
                    <li key={`${i.course}/${i.year}`}>
                        <Link to={link(i)} onClick={() => onClick ? onClick(i): null}>
                            {title(i)}
                        </Link>
                    </li>
                )
    }
    </ul>
}