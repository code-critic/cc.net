import React from "react";
import { observer } from "mobx-react";
import { Breadcrumb, Form } from "react-bootstrap";
import { CourseProblemSelectModel } from "./CourseProblemSelect.Model";
import { CourseSelect } from "./CourseSelect";
import { ProblemSelect } from "./ProblemSelect";
import { SimpleLoader } from "./SimpleLoader";
import * as H from 'history';
import { Link } from "react-router-dom";
import { DropdownButtonEx } from "../utils/DropdownButtonEx";


export interface ICourseYearProblem {
    course: string;
    year: string;
    problem: string;
}

export interface RouteComponentProps<P> {
    match: Match<P>;
    location: H.Location;
    history: H.History;
    staticContext?: any;
}

export interface Match<P> {
    params: P;
    isExact: boolean;
    path: string;
    url: string;
}

interface CourseProblemSelectProps extends ICourseYearProblem {
    model: CourseProblemSelectModel;
    history: H.History;
    prefix: string;
}

@observer
export class CourseProblemSelect extends React.Component<CourseProblemSelectProps, any, any> {

    public get courseYear() {
        const { course, year } = this.props;
        return (course && year) ? `${course}-${year}` : "";
    }

    renderBreadcrumbs() {
        const { courseYear } = this;
        const { course, year, problem, model, prefix, history } = this.props;


        return <Breadcrumb>
            <Breadcrumb.Item href={prefix} active={!course}>courses</Breadcrumb.Item>

            {/* {(course && year) && <Breadcrumb.Item href={prefix}>
                {course}-{year}
            </Breadcrumb.Item>} */}

            <DropdownButtonEx
                values={model.singleCourses}
                id={i => `${i.course}-${i.year}`}
                title={i => `${i.course}-${i.year}`}
                onSelect={i => {
                    model.problems.load(`courses-full/${i.course}/${i.year}`);
                    history.push(`/${prefix}/${i.course}/${i.year}/`)
                }}
                value={courseYear}
                size="sm"
                separator
            />

            {(courseYear && problem) &&
                <DropdownButtonEx
                    values={model.problems.data}
                    id={i => i.id}
                    title={i => i.name}
                    onSelect={i => history.push(`/${prefix}/${course}/${year}/${i.id}`)}
                    value={problem}
                    size="sm"
                    separator
                />
            }
        </Breadcrumb>
    }

    render() {
        const { model, course, year, problem, prefix } = this.props;
        const activeCourse = model.course(course, year);

        if (activeCourse && !model.problems.data.length) {
            model.problems.load(`courses-full/${course}/${year}`);
        }

        if (model.courses.isLoading || (model.problems && model.problems.isLoading)) {
            return <>
                {this.renderBreadcrumbs()}
                <SimpleLoader />
            </>
        }

        if (!activeCourse) {
            return <>
                {this.renderBreadcrumbs()}
                {CourseSelect(
                    model.courses.data,
                    i => `/${prefix}/${i.course}/${i.year}`,
                    i => model.problems.load(`courses-full/${i.course}/${i.year}`)
                )}
            </>
        }

        if (model.problems.isLoading) {
            return <>
                {this.renderBreadcrumbs()}
                <SimpleLoader />
            </>
        }

        const activeProblem = model.problem(problem);
        if (!activeProblem) {
            return <>
                {this.renderBreadcrumbs()}
                {ProblemSelect(
                    model.problems.data,
                    i => `/${prefix}/${course}/${year}/${i.id}`,
                )}
            </>
        }

        return <>
            {this.renderBreadcrumbs()}
        </>
    }
}