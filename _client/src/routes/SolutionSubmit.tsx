import React, { Suspense } from "react";

import { observable, computed } from "mobx";
import { observer } from "mobx-react";
import { reactLocalStorage } from 'reactjs-localstorage';
import { debounce } from 'throttle-debounce';
import { CourseProblemSelect, ICourseYearProblem, RouteComponentProps } from "../components/CourseProblemSelect";
import { CourseProblemSelectModel } from "../components/CourseProblemSelect.Model";
import { SimpleLoader } from "../components/SimpleLoader";
import { ILanguage, ICcData, ICourse, ICourseProblem, ISingleCourse, IAppUser } from "../models/DataModel";
import { ApiResource } from "../utils/ApiResource";
import { Grid, Button, ButtonGroup, Container, Breadcrumbs } from '@material-ui/core';


import SendIcon from '@material-ui/icons/Send';
import BubbleChartIcon from '@material-ui/icons/BubbleChart';
import AddCircleOutlineOutlinedIcon from '@material-ui/icons/AddCircleOutlineOutlined';
import CheckCircleOutlinedIcon from '@material-ui/icons/CheckCircleOutlined';

import { getUser, liveConnection, appDispatcher } from "../init";
import { StudentResultItem } from "../components/StudentResults.Item";
import { StudentResultsDialog } from "../components/StudentResultsDialog";
import { SolutionSubmitForm } from "./SolutionSubmit.Form";
import { NotificationManager } from 'react-notifications';
import { mapLanguage } from '../utils/LanguageMap';
import { IFile } from "../components/FileChooser";
import { CourseProblemSelector } from "../components/CourseProblemSelector";
import { flattenCourse } from "../utils/DataUtils";
import { openCloseState } from "../utils/StateUtils";
import { Link as RouterLink } from "react-router-dom";
import Link from "@material-ui/core/Link";
import NavigateNextIcon from '@material-ui/icons/NavigateNext';




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

    console.log(message);
    liveConnection.invoke("SubmitSolutions", ...message);
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

    const [apiCourses, setApiCourses] = React.useState(new ApiResource<ICourse>("courses", false));
    const [apiLanguages, setApiLanguages] = React.useState(new ApiResource<ILanguage>("languages", false));
    const [resultsDialog, setResultsDialog] = React.useState(false);
    const [openResults, closeResults] = openCloseState(setResultsDialog);

    
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
        return <SimpleLoader />
    });

    
    liveConnection.on("OnProcessStart", (item: ICcData) => {
        setLiveResult(item);
    });

    if (!user.role || !apiCourses.isLoaded || !apiLanguages.isLoaded) {
        return <SimpleLoader />
    }

    if (!problem || !activeProblem) {
        return <Container>
            <Breadcrumbs aria-label="breadcrumb" separator={<NavigateNextIcon fontSize="small" />} className="breadcrumb">
                <Link to={`/`} component={RouterLink}>courses</Link>
                {activeCourse && <Link to={`/courses/`} component={RouterLink}>{activeCourse.course}-{activeCourse.year}</Link>}
                {activeProblem && <Link to={`/courses/${activeCourse.course}/${activeCourse.year}`} component={RouterLink}>{activeProblem.name}</Link>}
            </Breadcrumbs>

            <CourseProblemSelector match={match}
                courses={courses} languages={languages}
                onProblemChange={(p) => setProblem(p)}
            />
        </Container>
    }

    const defaultLanguage = activeProblem.unittest
        ? languages.find(i => i.id === activeProblem.reference.lang)
        : languages[0];

    return <Container>
        <Breadcrumbs aria-label="breadcrumb" separator={<NavigateNextIcon fontSize="small" />} className="breadcrumb">
            <Link to={`/`} component={RouterLink}>courses</Link>
            <Link to={`/courses/`} component={RouterLink}>{activeCourse.course}-{activeCourse.year}</Link>
            <Link to={`/courses/${activeCourse.course}/${activeCourse.year}`} component={RouterLink}>{activeProblem.name}</Link>
        </Breadcrumbs>

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

// if (languages.isLoading) {
//     return <Container>
//         <CourseProblemSelect prefix="courses" model={model} history={history} {...this.props.match.params} />
//         <SimpleLoader></SimpleLoader>
//     </Container>
// }

// return (<>
//     <SolutionSubmitForm
//         enabledLanguages={enabledLanguages}
//         languages={languages.data}
//         selectedLanguage={selectedLanguage}
//         currentLanguage={currentLanguage}
//         prefferedCode={prefferedCode}
//         onLanguageChange={i => this.changeLanguage(i)}
//         onEditorChange={i => this.debounceChange(i)}
//         onEditorRef={i => this.ace = i}
//         onFileChange={files => this.handleNewFiles(files)}
//         activeProblem={activeProblem}
//     />
// </>);
