import React from "react";
import { Link } from "react-router-dom";
import { ICourse, ICourseYearConfig, ISingleCourse, ICourseProblem } from "../models/DataModel";


function defaultTitle(i: ICourseProblem) {
    return <>
        <strong>{i.name}</strong> &nbsp;
        <small>({i.id})</small>
    </>;
}

export const ProblemSelect = (problems: ICourseProblem[], link: (item: ICourseProblem) => string, title: (item: ICourseProblem) => JSX.Element = defaultTitle) => {
    return <ul>
        {
            problems
                .map(i =>
                    <li key={i.id}>
                        <Link to={link(i)}>
                            {title(i)}
                        </Link>
                    </li>
                )
        }
    </ul>
}