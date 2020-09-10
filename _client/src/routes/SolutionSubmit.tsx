import React, { Suspense, useEffect } from "react";

import { observable, computed } from "mobx";
import { observer } from "mobx-react";
import { reactLocalStorage } from 'reactjs-localstorage';
import { debounce } from 'throttle-debounce';
import { CourseProblemSelect, ICourseYearProblem, RouteComponentProps } from "../components/CourseProblemSelect";
import { CourseProblemSelectModel } from "../components/CourseProblemSelect.Model";
import { SimpleLoader } from "../components/SimpleLoader";
import { ILanguage, ICcData, ICourse, ICourseProblem, ISingleCourse, IAppUser } from "../models/DataModel";
import { ApiResource } from "../utils/ApiResource";
import { Grid, Button, ButtonGroup, Container, Breadcrumbs, Typography } from '@material-ui/core';


import SendIcon from '@material-ui/icons/Send';
import BubbleChartIcon from '@material-ui/icons/BubbleChart';
import AddCircleOutlineOutlinedIcon from '@material-ui/icons/AddCircleOutlineOutlined';
import CheckCircleOutlinedIcon from '@material-ui/icons/CheckCircleOutlined';

import { getUser, liveConnection, appDispatcher } from "../init";
import { StudentResultItem } from "../components/StudentResults.Item";
import { StudentResultsDialog } from "../components/StudentResultsDialog";
import { SolutionSubmitForm } from "./SolutionSubmit.Form";
import { NotificationManager } from 'react-notifications';
import { IFile } from "../components/FileChooser";
import { CourseProblemSelector } from "../components/CourseProblemSelector";
import { flattenCourse } from "../utils/DataUtils";
import { openCloseState } from "../utils/StateUtils";
import { Link as RouterLink } from "react-router-dom";
import Link from "@material-ui/core/Link";
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import HomeIcon from '@material-ui/icons/Home';
import ExtensionIcon from '@material-ui/icons/Extension';
import SchoolIcon from '@material-ui/icons/School';
import "../third_party/mathjax";

interface SolutionSubmitProps extends RouteComponentProps<ICourseYearProblem> {
}



interface LocalStorateCodeSnippet {
    code: string;
    date: Date,
    language: string;
}

const submitSolution = (user: IAppUser, activeCourse: ISingleCourse,
    activeProblem: ICourseProblem, language: ILanguage | undefined, files: IFile[]) => {

    // SubmitSolutions(string userId, string courseName, string courseYear, string problemId, string langId, IList<SimpleFile> files)
    var message: any[] = [
        user.id,
        activeCourse.course,
        activeCourse.year,
        activeProblem.id,
        language?.id,
        files.map(f => {
            return {
                name: f.name,
                path: f.path,
                content: f.content
            }
        })
    ];

    liveConnection.invoke("SubmitSolutions", ...message);
}

interface RenderBreadcrumbsProps {
    activeCourse?: ISingleCourse;
    activeProblem?: ICourseProblem;
}
const RenderBreadcrumbs = (props: RenderBreadcrumbsProps) => {
    const { activeCourse, activeProblem } = props;

    const breadcrumbComponents = [{
        to: `/courses`,
        title: <><HomeIcon fontSize="small" /> Courses</>
    }];
    if (activeCourse) {
        breadcrumbComponents.push({
            to: `/courses/${activeCourse.course}/${activeCourse.year}`,
            title: <><SchoolIcon fontSize="small" /> {`${activeCourse.course}-${activeCourse.year}`}</>
        });
    }

    if (activeCourse && activeProblem) {
        breadcrumbComponents.push({
            to: `/courses/${activeCourse.course}/${activeCourse.year}/${activeProblem.id}`,
            title: <><ExtensionIcon fontSize="small" /> {`${activeProblem.name}`}</>
        });
    }

    const last = breadcrumbComponents.length - 1;
    return <Breadcrumbs aria-label="breadcrumb" separator={<NavigateNextIcon fontSize="small" />} className="breadcrumb">
        {breadcrumbComponents.map((i, j) => {
            if (j == last) {
                return <Typography key={j} color="textPrimary">{i.title}</Typography>
            }
            return <Link key={j} to={i.to} component={RouterLink} className="display-flex">{i.title}</Link>
        })}
    </Breadcrumbs>
}
export const SolutionSubmit2 = (props) => {
    const [course, setCourse] = React.useState<ICourse>();
    const [isLoading, setIsLoading] = React.useState(false);

    const [courses, setCourses] = React.useState<ICourse[]>([]);
    const [languages, setLanguages] = React.useState<ILanguage[]>([]);

    useEffect(() => {
        setIsLoading(true);
        var promises = [
            new ApiResource<ICourse>("courses", false).load(),
            new ApiResource<ILanguage>("languages", false).load()
        ] as Promise<any>[];

        Promise.all(promises)
        .then((data: any) => {
            setCourses(data[0]);
            setLanguages(data[1]);
            setIsLoading(false);
        });
    }, []);

    useEffect(() => {
        console.log("effect course");
    }, [course]);

    if (isLoading || !courses || !languages) {
        return <SimpleLoader />
    }

    return <Button onClick={() => setCourse({} as any)}>ok</Button>
}

export const SolutionSubmit = (props) => {

    const { history, match } = props;
    const [courses, setCourses] = React.useState<ICourse[]>([]);
    const [languages, setLanguages] = React.useState<ILanguage[]>([]);

    const [liveResult, setLiveResult] = React.useState<ICcData>();
    const [forcedResultId, setForcedResultId] = React.useState("");
    const [problem, setProblem] = React.useState<ICourseProblem>();
    const [user, setUser] = React.useState(getUser());
    const [files, setFiles] = React.useState<IFile[]>([]);
    const [language, setLanguage] = React.useState<ILanguage>();
    const [params, setParams] = React.useState<any>();

    const [apiCourses, setApiCourses] = React.useState(new ApiResource<ICourse>("courses", false));
    const [apiLanguages, setApiLanguages] = React.useState(new ApiResource<ILanguage>("languages", false));
    const [resultsDialog, setResultsDialog] = React.useState(false);
    const [openResults, closeResults] = openCloseState(setResultsDialog);

    useEffect(() => {
        const MathJax = (window as any).MathJax;
        if (MathJax && MathJax.typeset) {
            MathJax.typeset();
        }
    });


    const { course: urlCourse, year: urlYear, problem: urlProblem } = match.params;
    const activeProblem = problem;
    const coursesFlatten = courses.flatMap(flattenCourse);
    const activeCourse = coursesFlatten.find(i => i.course == urlCourse && i.year == urlYear) as ISingleCourse;

    apiCourses.loadState(setCourses);
    apiLanguages.loadState(setLanguages);


    appDispatcher.register((payload: any) => {
        if (payload.actionType == "userChanged") {
            setUser(getUser());
        }
    });

    history.listen((location, action) => {
        setProblem(undefined);
        // setParams(match.params);
    });


    liveConnection.on("OnProcessStart", (item: ICcData) => {
        setLiveResult(item);
    });

    if (!user.role || !apiCourses.isLoaded || !apiLanguages.isLoaded) {
        return <SimpleLoader />
    }




    if (!problem || !activeProblem) {
        return <Container>
            <RenderBreadcrumbs activeCourse={activeCourse} activeProblem={activeProblem} />

            <CourseProblemSelector match={match} history={history} params={params}
                courses={courses} languages={languages}
                onProblemChange={(p) => setProblem(p)}
            />
        </Container>
    }

    const defaultLanguage = activeProblem.unittest
        ? languages.find(i => i.id === activeProblem.reference.lang)
        : languages[0];


    return <Container>
        <RenderBreadcrumbs activeCourse={activeCourse} activeProblem={activeProblem} />

        <Grid container spacing={2}>
            {/* live result */}
            {liveResult && <Grid item xs={12} sm={12} lg={12}>
                <StudentResultItem
                    item={liveResult}
                    languages={languages}
                    onClick={() => {
                        setForcedResultId(liveResult.objectId);
                        openResults();
                    }}
                />
            </Grid>}

            {/* col 1 */}
            <Grid item xs={12} sm={12} lg={6}>
                {/* description */}
                <div className="description" dangerouslySetInnerHTML={{ __html: problem.description }}>
                </div>
            </Grid>

            {/* col 2 */}
            <Grid item xs={12} sm={12} lg={6}>

                {/* generate i/o */}
                {user.role === "root" && problem.unittest === false &&
                    <ButtonGroup size="large" fullWidth>
                        <Button startIcon={<AddCircleOutlineOutlinedIcon />} onClick={() => {
                            // this.generateInput()
                        }}>Generate Input</Button>
                        <Button endIcon={<CheckCircleOutlinedIcon />} onClick={() => {
                            // this.generateOutput()
                        }}>Generate Output</Button>
                    </ButtonGroup>
                }
                {/* form */}
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <SolutionSubmitForm
                            onLanguageChange={setLanguage}
                            languages={languages}
                            onFileChange={setFiles}
                            activeProblem={problem}
                            defaultLanguage={defaultLanguage || languages[0]}
                        />
                    </Grid>
                </Grid>

                {/* submit/results */}
                <Grid item xs={12} container className="button bar my-2" justify="space-between">
                    <Button size="large" variant="outlined" color="secondary" endIcon={<BubbleChartIcon />}
                        onClick={openResults}>View Results</Button>
                    <Button size="large" variant="contained" color="primary" endIcon={<SendIcon />}
                        onClick={() => submitSolution(user, activeCourse, activeProblem, language || defaultLanguage, files)}>Submit Solution</Button>
                </Grid>
            </Grid>
        </Grid>
        {resultsDialog &&
            <StudentResultsDialog
                onClose={closeResults}
                languages={languages}
                activeProblem={activeProblem}
                activeCourse={activeCourse}
                forcedResultId={forcedResultId}
            />
        }
    </Container>
}
