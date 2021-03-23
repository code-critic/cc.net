import React from "react";
import { ICourseProblem } from "../models/DataModel";
import { ProblemPicker } from "./ProblemPicker";


interface SubmitSolutionProps {
    courseProblem: ICourseProblem;
}

export const SubmitSolution = (props: SubmitSolutionProps) => {
    const { courseProblem } = props;
    return <div>
        <div>so, you have selected {courseProblem.id}</div>
        <div dangerouslySetInnerHTML={{__html: courseProblem.description}} />
    </div>
}

export const SubmitSolutionWithComponent = (props: SubmitSolutionProps) => {
    return <ProblemPicker component={SubmitSolution} baseUrl="/courses" />
}