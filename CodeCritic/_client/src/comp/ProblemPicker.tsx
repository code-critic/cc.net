import { Button } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import { API } from "../api";
import { SimpleLoader } from "../components/SimpleLoader";
import { IApiListResponse } from "../models/CustomModel";
import { ICourseProblem, ISingleCourse } from "../models/DataModel";
import { renderError } from "../renderers/renderErrors";
import { RenderBreadcrumbs } from "../renderers/BreadcrumbsRenderer";
import { useUser } from "../hooks/useUser";


interface ProblemPickerProps {
    baseUrl: string;

    component?: React.ComponentType<any>;
    home?: JSX.Element;
    tileStyle?: 'small' | 'big';
    displayAlways?: boolean;
    withBreadcrumbs?: boolean;
    whereUserIsTeacher?: boolean;
}

export const ProblemPicker = (props: ProblemPickerProps) => {
    const { baseUrl, tileStyle = 'small', displayAlways = false, withBreadcrumbs = false, home, whereUserIsTeacher = false } = props;
    const Component = props.component as any;
    const [coursesResponse, setCoursesResponse] = useState<IApiListResponse<ISingleCourse>>();
    const [courseResponse, setCourseResponse] = useState<IApiListResponse<ICourseProblem>>();
    const [courseProblem, setCourseProblem] = useState<ICourseProblem>();
    const [isLoading, setIsLoading] = useState(false);

    const { user } = useUser();

    const { course, year, problem } = useParams<any>();
    // const history = useHistory();

    useEffect(() => {
        (async () => {

            if (!coursesResponse) {
                setIsLoading(true);
                const axiosResponse = await API.get<IApiListResponse<ISingleCourse>>(`course-list`);
                setIsLoading(false);
                setCoursesResponse(axiosResponse.data);
            }

            if (course && year) {
                let tmpCourseResponse = courseResponse;

                if (!courseResponse) {
                    setIsLoading(true);
                    const axiosResponse = await API.get<IApiListResponse<ICourseProblem>>(`course-problem/${course}/${year}`);
                    setIsLoading(false);
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

    const userIsTeacher = (course: ISingleCourse) => {
        return course.settingsConfig.teachers.length == 0
            || course.settingsConfig.teachers.some(j => j.id === user.id);
    }


    const drawResponse = () => {
        if (!coursesResponse || isLoading) {
            return <SimpleLoader title="Loading..." />
        }

        if (!courseResponse) {
            return (<>
                <div className={`picker picker-level-course picker-style-${tileStyle}`}>
                    {coursesResponse.errors.map(renderError)}
                    {coursesResponse.data
                        .filter(i => !whereUserIsTeacher || userIsTeacher(i))
                        .map((i, j) => {
                            const currentYear = i.year === new Date().getFullYear().toString()
                                ? "picker-current" : "picker-old";
                            return <Button 
                                className={currentYear}
                                key={j} component={Link}
                                to={`${baseUrl}/${i.course}/${i.year}`}>
                                {i.course}/{i.year}
                            </Button>
                        })}
                </div>
            </>)
        }

        if (!courseProblem && courseResponse) {
            return <div className={`picker picker-level-problem picker-style-${tileStyle}`}>
                <div>
                    {courseResponse.errors.map(renderError)}
                    {courseResponse.data
                        .map((i, j) => <Button key={j} component={Link} to={`${baseUrl}/${course}/${year}/${i.id}`}>{i.id} ({i.name})</Button>)}
                </div>
            </div>
        }
    }

    const activeCourse = coursesResponse?.data.find(i => i.course === course && i.year === year);
    const activeProblem = courseProblem;
    const componentVisible = !!Component && (displayAlways || !!activeCourse && !!activeProblem);

    return <>
        {withBreadcrumbs && <RenderBreadcrumbs home={home} activeCourse={activeCourse} activeProblem={activeProblem} baseUrl={baseUrl} />}
        {drawResponse()}
        {componentVisible && <Component
            problem={activeProblem}
            course={activeCourse}
        />}
    </>
}