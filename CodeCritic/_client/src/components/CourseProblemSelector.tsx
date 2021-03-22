import { Typography, Tooltip, Grid, Card, Button } from "@material-ui/core";
import React, { useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import { getUser } from "../init";
import { ICourse, ICourseProblem, ICourseYearConfig, ILanguage, ISingleCourse } from "../models/DataModel";
import { ApiResource } from "../utils/ApiResource";
import { groupBy } from "../utils/arrayUtils";
import { flattenCourse } from "../utils/DataUtils";
import { randomColorCss } from "../utils/randomcolor";
import { getStatus, isStatusOk } from "../utils/StatusUtils";
import { StatusMessage } from "./CourseProblemSelector.renderers";
import { SimpleLoader } from "./SimpleLoader";

interface CourseProblemSelectorProps {
    courses: ICourse[];
    languages: ILanguage[];
    match: any;
    history: any;
    params: any;
    onProblemChange(problem?: ICourseProblem);
}

const problemFromUrl = (params: any, problems: ICourseProblem[]) => {
    const { course: urlCourse, year: urlYear, problem: urlProblem } = params;
    return problems.find(i => i.id == urlProblem);
}

const courseFromUrl = (params: any, courses: ICourse[]) => {
    const { course: urlCourse, year: urlYear, problem: urlProblem } = params;
    const coursesFlatten = courses.flatMap(flattenCourse);
    return coursesFlatten.find(i => i.course == urlCourse && i.year == urlYear);
}



export const CourseProblemSelector = (props: CourseProblemSelectorProps) => {
    const [course, setCourse] = React.useState<ISingleCourse>();
    const [problem, setProblem] = React.useState<ICourseProblem>();
    const [fullProblem, setFullProblem] = React.useState<ICourseProblem>();
    const [problems, setProblems] = React.useState<ICourseProblem[]>();
    const [bestResults, setBestResults] = React.useState<ICourseYearConfig>();

    const { courses, match, onProblemChange, history } = props;
    const { course: urlCourse, year: urlYear, problem: urlProblem } = match.params;
    const coursesFlatten = courses.flatMap(flattenCourse);
    const courseHint = coursesFlatten.find(i => i.course == urlCourse && i.year == urlYear);
    const user = getUser();


    useEffect(() => {
        if (!course) {
            return;
        }
        new ApiResource<ICourseYearConfig>(`course/${course.course}/${course.year}`, false)
            .load()
            .then(data => {
                setBestResults(data as any as ICourseYearConfig);
            });
    }, [course]);


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
        if (!courseHint) {
            setCourse(undefined);
            // setFullProblem(undefined);
            setProblem(undefined);
            setProblems(undefined);
            onProblemChange(undefined);
            return <SimpleLoader />
        }
    }

    const renderCourseCard = (sc: ISingleCourse, index: any) => {
        const fullname = `/courses/${sc.course}/${sc.year}`;
        return <Grid item xs={12} sm={6} lg={3} key={index}>
            <Card elevation={3}>
                <div className="color-bar" style={randomColorCss(fullname)} />
                <Button component={RouterLink}
                    to={fullname}
                    onClick={() => changeCourse(sc)}>
                    <div>
                        <Typography gutterBottom variant="h5" component="h2">
                            {sc.course} ({sc.year})
                                    </Typography>
                        <Typography variant="body2" color="textSecondary" component="p">
                            {sc.problems.length} problem{sc.problems.length == 1 ? "" : "s"} available
                                    </Typography>
                    </div>
                </Button>
            </Card>
        </Grid>
    }

    if (!course) {
        const groupByYears = groupBy(coursesFlatten.sort((b, a) => Number(a.year) - Number(b.year)), i => i.year);
        let results: JSX.Element[] = [];
        groupByYears.forEach((items, year) => {
            results.push(<h1 className="my-4" key={year}>{year}</h1>);
            results = [...results, 
                <Grid key={`${year}-grp`} container spacing={2} className="card-select">
                    {items.map((i, j) => renderCourseCard(i, `${year}-${j}`))}
                </Grid>
            ];
        });

        const invalidCourses = courses
            .filter(i => i.errors.length > 0 && user.role == "root");

        return <>
            <Grid container spacing={2} className="card-select">
                {invalidCourses.length > 0 &&
                    invalidCourses.map(i => {
                        return (<>
                            <Grid key={i.name} item xs={12} sm={12} lg={12}>
                                <Card elevation={3} style={{padding: 10, border: "2px solid red"}}>
                                    <h3>{i.name}</h3>
                                    <small>
                                        <ul>
                                            {i.errors.map((j, k) => <li><code>{j}</code></li>)}
                                        </ul>
                                    </small>
                                </Card>
                                <div className="text-right"><small><em>Visible to admins only</em></small></div>
                                <hr />
                            </Grid>
                        </>);
                    })}
                {results}
            </Grid>
        </>
    }

    if (!bestResults) {
        return <SimpleLoader />
    }

    const problemHint = course.problems.find(i => i.id == urlProblem);

    if (!problem) {
        if (problemHint) {
            setProblem(problemHint);
        }
    }

    if (!problem) {
        const user = getUser();
        return <>
            <Grid container spacing={2} className="card-select">
                {course.problems.map((i, j) => {
                    const fullname = `/courses/${course.course}/${course.year}/${i.id}`;
                    const res = bestResults.results.flatMap(i => i).filter(j => j.problem == i.id);
                    
                    const extraClass = `item-${i.status}`;

                    return <Grid item xs={12} sm={6} lg={3} key={j} className={extraClass}>
                        <Card elevation={3}>
                            <div className="color-bar" style={randomColorCss(fullname)} />
                            <Typography variant="body2" className="card-footer" color="textSecondary" component="small">
                                <StatusMessage problem={i} />
                            </Typography>
                            <Button component={RouterLink}
                                to={fullname}
                                onClick={() => changeProblem(i)}>
                                <div>
                                    <Typography gutterBottom variant="h5" component="h2">
                                        {i.name}
                                    </Typography>
                                </div>
                            </Button>
                            <Typography variant="body2" className="card-footer" color="textSecondary" component="small">
                                {res.length > 0 &&
                                    <>
                                        <div className="result-status-bar">
                                            <span>Top 3 results: </span>
                                            {res.map(i => {
                                                const status = getStatus(i.result.status);
                                                const className = `button result-status result-status-${isStatusOk(status.value)}`;
                                                const score = i.result.scores.join(", ");
                                                return <Tooltip title={`${status.name} (score: ${score})`} key={i.objectId}>
                                                    <a role="button"
                                                        onClick={() => history.push(`/r/${i.objectId}`)}
                                                        className={className}>
                                                        {status.letter}
                                                    </a>
                                                </Tooltip>
                                            })}
                                        </div>
                                    </>
                                }
                                {res.length == 0 &&
                                    <span className="h-30">No results</span>
                                }
                            </Typography>
                        </Card>
                    </Grid>
                }
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