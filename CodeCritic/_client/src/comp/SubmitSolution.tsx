import { Button } from "@material-ui/core";
import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router";
import { Link } from "react-router-dom";

import { API } from "../api";
import { SimpleLoader } from "../components/SimpleLoader";
import { ISingleCourse, ICourseProblem } from "../models/DataModel";
import { IApiListResponse, IApiResponse } from "../models/CustomModel";
import { renderError } from "../renderers/renderErrors";
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
    return <ProblemPicker component={SubmitSolution} />
}