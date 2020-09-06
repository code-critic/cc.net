import React from "react";
import { ICourseProblem, ICourse, ILanguage, ISingleCourse } from "../models/DataModel";
import Button from "@material-ui/core/Button";
import { Link as RouterLink } from "react-router-dom";
import { flattenCourse } from "../utils/DataUtils";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import Typography from "@material-ui/core/Typography";
import { ApiResource } from "../utils/ApiResource";
import { SimpleLoader } from "./SimpleLoader";

interface CourseProblemSelectorProps {
    courses: ICourse[];
    languages: ILanguage[];
    match: any;

    onProblemChange(problem?: ICourseProblem);
}


export const CourseProblemSelector = (props: CourseProblemSelectorProps) => {
    const [course, setCourse] = React.useState<ISingleCourse>();
    const [problem, setProblem] = React.useState<ICourseProblem>();
    const [fullProblem, setFullProblem] = React.useState<ICourseProblem>();
    const [problems, setProblems] = React.useState<ICourseProblem[]>();

    const { courses, match, onProblemChange } = props;
    const { course: urlCourse, year: urlYear, problem: urlProblem } = match.params;
    const coursesFlatten = courses.flatMap(flattenCourse);
    const courseHint = coursesFlatten.find(i => i.course == urlCourse && i.year == urlYear);


    const changeCourse = (course: ISingleCourse) => {
        setCourse(course);
    }

    const changeProblem = (problem: ICourseProblem) => {
        setProblem(problem);
    }


    if (!course) {
        if (courseHint != undefined) {
            setCourse(courseHint);
        }
    } else {
        if(!courseHint) {
            setCourse(undefined);
            // setFullProblem(undefined);
            setProblem(undefined);
            setProblems(undefined);
            onProblemChange(undefined);
            return <SimpleLoader />
        }
    }

    if (!course) {
        return <>
            <Grid container spacing={2} className="card-select">
                {coursesFlatten.map((i, j) =>
                    <Grid item xs={12} sm={6} lg={3} key={j}>
                        <Card elevation={3}>
                            <Button component={RouterLink}
                                to={`/courses/${i.course}/${i.year}`}
                                onClick={() => changeCourse(i)}>
                                <div>
                                    <Typography gutterBottom variant="h5" component="h2">
                                        {i.course} ({i.year})
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" component="p">
                                        {i.problems.length} problem{i.problems.length == 1 ? "" : "s"} available
                                    </Typography>
                                </div>
                            </Button>
                        </Card>
                    </Grid>
                )}
            </Grid>
        </>
    }

    const problemHint = course.problems.find(i => i.id == urlProblem);

    if(!problem) {
        if (problemHint) {
            setProblem(problemHint);
        }
    }

    if (!problem) {
        return <>
            <Grid container spacing={2} className="card-select">
                {course.problems.map((i, j) =>
                    <Grid item xs={12} sm={6} lg={3} key={j}>
                        <Card elevation={3}>
                            <Button component={RouterLink}
                                to={`/courses/${course.course}/${course.year}/${i.id}`}
                                onClick={() => changeProblem(i)}>
                                <div>
                                    <Typography gutterBottom variant="h5" component="h2">
                                        {i.name}
                                    </Typography>
                                </div>
                            </Button>
                        </Card>
                    </Grid>
                )}
            </Grid>
        </>
    }

    if (!problems) {
        new ApiResource<ICourseProblem>('', false)
            .load(`courses-full/${course.course}/${course.year}`)
            .then(data => {
                setProblems(data);
            });
            return <SimpleLoader />
    }

    if (problems && !fullProblem) {
        const p = problems.find(i => i.id == problem.id);
        if (p != undefined) {
            setFullProblem(p);
            onProblemChange(p);
        } else {
            setCourse(undefined);
            setProblem(undefined);
            setProblems(undefined);
            onProblemChange(undefined);
            setFullProblem(undefined);
        }
    }
    

    return <SimpleLoader />
}