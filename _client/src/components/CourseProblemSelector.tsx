import React, { useEffect } from "react";
import { ICourseProblem, ICourse, ILanguage, ISingleCourse, ICourseYearConfig } from "../models/DataModel";
import Button from "@material-ui/core/Button";
import { flattenCourse } from "../utils/DataUtils";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import Typography from "@material-ui/core/Typography";
import { ApiResource } from "../utils/ApiResource";
import { randomColorCss } from "../utils/randomcolor";
import { SimpleLoader } from "./SimpleLoader";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import { Link as RouterLink } from "react-router-dom";
import Link from "@material-ui/core/Link";
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import { getStatus, isStatusOk } from "../utils/StatusUtils";
import Tooltip from '@material-ui/core/Tooltip';
import { groupBy } from "../utils/arrayUtils";
import { getUser } from "../init";
import { ProblemStatus } from "../models/Enums";
import { StatusMessage } from "./CourseProblemSelector.renderers";

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


export const CourseProblemSelector2 = (props: CourseProblemSelectorProps) => {
    console.log("start");

    const { courses, history, match, onProblemChange, params } = props;

    const [course, setCourse] = React.useState<ISingleCourse>();
    const [problem, setProblem] = React.useState<ICourseProblem>();
    const [courseYear, setCourseYear] = React.useState<ICourseYearConfig>();
    const [isLoading, setIsLoading] = React.useState(false);

    const coursesFlatten = courses.flatMap(flattenCourse);

    useEffect(() => {
        // history.listen((location, action) => {
        //     console.log("change");
        //     // debugger;

        //     // if(course) {
        //     //     const urlCourse = courseFromUrl(match.params, courses);
        //     //     if(!urlCourse || course.course != urlCourse.course || course.year != urlCourse.year) {
        //     //         debugger;
        //     //         setCourse(urlCourse);
        //     //         setProblem(undefined);
        //     //         setCourseYear(undefined);
        //     //         onProblemChange(undefined);
        //     //     }

        //     //     if(problem && courseYear) {
        //     //         const urlProblem = problemFromUrl(match.params, courseYear.problems);
        //     //         debugger;
        //     //         if(!urlProblem || urlProblem.id != problem.id) {
        //     //             setProblem(undefined);
        //     //             setCourseYear(undefined);
        //     //             onProblemChange(undefined);
        //     //         }
        //     //     }
        //     // }

        //     // // setProblem(undefined);
        //     // // setCourse(undefined);
        //     // // setIsLoading(true);
        // });
    }, []);

    useEffect(() => {
        if (!course) {
            return;
        }
        console.log("loading year course");

        setIsLoading(true);
        new ApiResource<ICourseYearConfig>(`course/${course.course}/${course.year}`, false)
            .load()
            .then(data => {
                setCourseYear(data as any as ICourseYearConfig);
                setIsLoading(false);
            });
    }, [course]);


    console.log(params);
    const urlCourse = courseFromUrl(match.params, courses);
    if (urlCourse) {
        if (!course || course.course != urlCourse.course || course.year != urlCourse.year) {
            console.log("setting course from url");
            setCourse(urlCourse);
        }
    }

    if (course && courseYear) {
        const urlProblem = problemFromUrl(match.params, courseYear.problems);
        if (urlProblem) {
            if (!problem || problem.id != urlProblem.id) {
                console.log("setting problem from url");
                setProblem(urlProblem);
                onProblemChange(urlProblem);
            }
        }
    }

    if (isLoading) {
        return <SimpleLoader />
    }

    if (!course) {
        return <>
            <Grid container spacing={2} className="card-select">
                {coursesFlatten.map((i, j) =>
                    <Grid item xs={12} sm={6} lg={3} key={j}>
                        <Card elevation={3}>
                            <Button component={RouterLink}
                                to={`/courses/${i.course}/${i.year}`}
                                onClick={() => setCourse(i)}>
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

    if (!courseYear) {
        return <span>waiting on course year</span>
    }

    if (!problem) {
        return <>
            <Grid container spacing={2} className="card-select">
                {courseYear.problems.map((i, j) => {
                    const res = courseYear.results.flatMap(i => i).filter(j => j.problem == i.id);
                    return <Grid item xs={12} sm={6} lg={3} key={j} >
                        <Card elevation={3}>
                            <Button component={RouterLink}
                                to={`/courses/${course.course}/${course.year}/${i.id}`}
                                onClick={() => {
                                    setProblem(i)
                                    onProblemChange(i);
                                }}>
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
                                                return <a
                                                    role="button"
                                                    onClick={() => history.push(`/r/${i.objectId}`)}
                                                    className={className}>
                                                    {status.letter}
                                                </a>
                                            })}
                                        </div>
                                    </>
                                }
                                {res.length == 0 &&
                                    <span className="h-30">No results submitted</span>
                                }
                            </Typography>
                        </Card>
                    </Grid>
                }
                )}
            </Grid>
        </>
    }

    return <span>ok</span>
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

        return <>
            <Grid container spacing={2} className="card-select">
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
                                                return <Tooltip title={`${status.name} (score: ${score})`}>
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