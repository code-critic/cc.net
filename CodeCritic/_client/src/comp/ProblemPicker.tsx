import { Button } from "@material-ui/core";
import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router";
import { Link } from "react-router-dom";

import { API } from "../api";
import { SimpleLoader } from "../components/SimpleLoader";
import { ISingleCourse, ICourseProblem } from "../models/DataModel";
import { IApiListResponse, IApiResponse } from "../models/CustomModel";
import { renderError } from "../renderers/renderErrors";

interface ProblemPickerProps {
    component?: React.ComponentType<any>;
}

export const ProblemPicker = (props: ProblemPickerProps) => {
    const Component = props.component as any;
    const [coursesResponse, setCoursesResponse] = useState<IApiListResponse<ISingleCourse>>();
    const [courseResponse, setCourseResponse] = useState<IApiListResponse<ICourseProblem>>();
    const [courseProblem, setCourseProblem] = useState<ICourseProblem>();

    const { course, year, problem } = useParams<any>();
    // const history = useHistory();

    useEffect(() => {
        (async () => {

            if (!coursesResponse) {
                const axiosResponse = await API.get<IApiListResponse<ISingleCourse>>(`course-list`);
                setCoursesResponse(axiosResponse.data);
            }

            if (course && year) {
                let tmpCourseResponse = courseResponse;

                if (!courseResponse) {
                    const axiosResponse = await API.get<IApiListResponse<ICourseProblem>>(`course-problem/${course}/${year}`);
                    tmpCourseResponse = axiosResponse.data;
                    setCourseResponse(axiosResponse.data);
                }

                if (problem) {
                    if (!courseProblem && tmpCourseResponse) {
                        setCourseProblem(tmpCourseResponse.data.find(i => i.id == problem));
                    }
                } else {
                    setCourseProblem(undefined);
                }
            } else {
                setCourseResponse(undefined);
            }

        })();
    }, [course, year, problem]);

    if (!coursesResponse) {
        return <SimpleLoader title="Loading courses" />
    }


    if (!courseResponse) {
        return <div>
            {coursesResponse.errors.map(renderError)}
            {coursesResponse.data
                .map((i, j) => <Button key={j} component={Link} to={`/courses/${i.course}/${i.year}`}>{i.course}/{i.year}</Button>)}
        </div>
    }

    if (!courseProblem) {
        return <div>
            <div>
                {courseResponse.errors.map(renderError)}
                {courseResponse.data
                    .map((i, j) => <Button key={j} component={Link} to={`/courses/${course}/${year}/${i.id}`}>{i.id} ({i.name})</Button>)}
            </div>
        </div>
    }

    return <Component courseProblem={courseProblem} />
}