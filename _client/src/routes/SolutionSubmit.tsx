import React, { Suspense } from "react";

import { observable, computed } from "mobx";
import { observer } from "mobx-react";
import { reactLocalStorage } from 'reactjs-localstorage';
import { debounce } from 'throttle-debounce';
import { CourseProblemSelect, ICourseYearProblem, RouteComponentProps } from "../components/CourseProblemSelect";
import { CourseProblemSelectModel } from "../components/CourseProblemSelect.Model";
import { SimpleLoader } from "../components/SimpleLoader";
import { ILanguage, ICcData, ICourse, ICourseProblem } from "../models/DataModel";
import { ApiResource } from "../utils/ApiResource";
import { Grid, Button, ButtonGroup, Container } from '@material-ui/core';


import SendIcon from '@material-ui/icons/Send';
import BubbleChartIcon from '@material-ui/icons/BubbleChart';
import AddCircleOutlineOutlinedIcon from '@material-ui/icons/AddCircleOutlineOutlined';
import CheckCircleOutlinedIcon from '@material-ui/icons/CheckCircleOutlined';

import { currentUser, liveConnection, appDispatcher } from "../init";
import { StudentResultItem } from "../components/StudentResults.Item";
import { StudentResultsDialog } from "../components/StudentResultsDialog";
import { SolutionSubmitForm } from "./SolutionSubmit.Form";
import { NotificationManager } from 'react-notifications';
import { mapLanguage } from '../utils/LanguageMap';
import { IFile } from "../components/FileChooser";




interface SolutionSubmitProps extends RouteComponentProps<ICourseYearProblem> {
}



interface LocalStorateCodeSnippet {
    code: string;
    date: Date,
    language: string;
}

export const SolutionSubmit = (props) => {

    const { history, match } = props;
    const [courses, setCourses] = React.useState<ICourse[]>([]);
    const [languages, setLanguages] = React.useState<ILanguage[]>([]);

    const [liveResult, setLiveResult] = React.useState<ICcData>();
    const [, setActiveProblem] = React.useState<ICourseProblem>();
    const [model, setModel] = React.useState(new CourseProblemSelectModel());

    const getActiveProblem = () => {
        const { problem } = match.params;
        return model.problem(problem);
    }

    model.onProblemChanged = () => {
        setActiveProblem(getActiveProblem());
    }

    if (courses.length == 0) {
        model.courses.load()
            .then(data => setCourses(data));
    }

    if (languages.length == 0) {
        model.languages.load()
            .then(data => setLanguages(data));
    }

    if (courses.length === 0 || languages.length === 0) {
        return <SimpleLoader />
    }

    if (!getActiveProblem()) {
        return <Container>
            <CourseProblemSelect prefix="courses" model={model} history={history} {...match.params} />
        </Container>
    }

    const problem = getActiveProblem() as ICourseProblem;
    return (<>
        <Container>
            <CourseProblemSelect prefix="courses" model={model} history={history} {...match.params} />

            <Grid container spacing={2}>
                {liveResult && <Grid item xs={12} sm={12} lg={12}>
                    <StudentResultItem
                        item={liveResult}
                        languages={languages}
                        onClick={() => {
                            // this.forcedResultId = liveResult.objectId
                            // this.openResultDialog()
                        }}
                    />
                </Grid>}


                <Grid item xs={12} sm={12} lg={6}>
                    <div className="description" dangerouslySetInnerHTML={{ __html: problem.description }}>
                    </div>
                </Grid>

                <Grid item xs={12} sm={12} lg={6}>
                    {currentUser.role === "root" && problem.unittest === false &&
                        <ButtonGroup size="large" fullWidth>
                            <Button startIcon={<AddCircleOutlineOutlinedIcon />} onClick={() => {
                                // this.generateInput()
                            }}>
                                Generate Input
                                    </Button>
                            <Button endIcon={<CheckCircleOutlinedIcon />} onClick={() => {
                                // this.generateOutput()
                            }}>
                                Generate Output
                                    </Button>
                        </ButtonGroup>
                    }

                    <Grid container spacing={3}>
                        <SolutionSubmitForm
                            onLanguageChange={language => {
                                // 
                            }}
                            languages={languages}
                            onFileChange={files => {
                                // this.handleNewFiles(files)
                            }}
                            activeProblem={problem}
                        />

                        <Grid item xs={12} container className="button bar" justify="space-between">
                            <Button onClick={() => {
                                // this.openResultDialog()
                            }}
                                size="large" variant="outlined" color="secondary" endIcon={<BubbleChartIcon />}>
                                View Results
                                    </Button>
                            {/* {(resultsDialogOpen && activeCourse && activeProblem) &&
                                <StudentResultsDialog
                                    onClose={() => {
                                        // this.resultsDialogOpen = false;
                                        // this.forcedResultId = "";
                                    }}
                                    languages={languages}
                                    activeCourse={activeCourse}
                                    activeProblem={activeProblem}
                                    forcedResultId={forcedResultId}
                                />
                            } */}
                            <Button size="large" variant="contained" color="primary" endIcon={<SendIcon />}
                                onClick={() => {
                                    // this.submitSolution()
                                }}>
                                Submit Solution
                                    </Button>
                        </Grid>

                    </Grid>
                </Grid>
            </Grid>
        </Container>
    </>);
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

@observer
export class SolutionSubmit2 extends React.Component<SolutionSubmitProps, any, any> {

    @observable
    public model: CourseProblemSelectModel = new CourseProblemSelectModel();

    @observable
    public languages: ApiResource<ILanguage> = new ApiResource<ILanguage>("languages", false);

    @observable selectedLanguage: string = "";

    public ace: any;


    @observable
    public exampleDialogOpen = false;


    @observable
    public resultsDialogOpen = false;


    @observable
    public liveResult?: ICcData;

    @computed
    private get prefferedCode() {
        const lastSolution: LocalStorateCodeSnippet = reactLocalStorage.getObject(this.problemLanguagePath);
        const code = lastSolution.code ? lastSolution.code : "";

        if (this.ace) {
            this.ace.editor.setValue(code);
        }
        return code;
    }

    @observable
    public forceUpdateField = 0;

    public forcedResultId: string = "";

    constructor(props: SolutionSubmitProps) {
        super(props);

        const { problemPath } = this;

        // recover from ls
        const languageCandidate = this.problemPath ? reactLocalStorage.getObject(problemPath) : {};

        if (languageCandidate.language) {
            if (!this.selectedLanguage) {
                this.selectedLanguage = languageCandidate.language;
            }
        }


        this.languages.load()
            .then(() => {
                if (!this.selectedLanguage) {
                    this.selectedLanguage = this.languages.data[0].id;
                }
            });


        liveConnection.on("OnProcessStart", (item: ICcData) => {
            this.liveResult = item;
        });


        appDispatcher.register((payload: any) => {
            if (payload.actionType == "commentServiceChanged") {
                this.forceUpdateField++;
            }
        });
    }

    public get problemPath() {
        const { course, year, problem } = this.props.match.params;
        if (!course || !year || !problem) {
            return null;
        }
        return `${course}/${year}/${problem}`;
    }

    public get problemLanguagePath() {
        const { course, year, problem } = this.props.match.params;
        if (!course || !year || !problem || !this.selectedLanguage) {
            return null;
        }
        return `${course}/${year}/${problem}/${this.selectedLanguage}`;
    }

    private debounceChange: (state: any) => void = debounce(300, false, () => {
        const { problemPath, problemLanguagePath, selectedLanguage } = this;
        if (!problemPath || !problemLanguagePath) {
            return;
        }

        const codeSnippet: LocalStorateCodeSnippet = {
            code: this.ace.editor.getValue(),
            date: new Date(),
            language: selectedLanguage
        }

        const problemInfo = {
            language: selectedLanguage
        }

        reactLocalStorage.setObject(problemLanguagePath, codeSnippet);
        reactLocalStorage.setObject(problemPath, problemInfo);
    })

    public handleNewFiles(files: IFile[]) {

    }

    public get activeCourse() {
        const { course, year } = this.props.match.params;
        return this.model.course(course, year);
    }

    public get activeProblem() {
        const { problem } = this.props.match.params;
        return this.model.problem(problem);
    }

    public get currentLanguage() {
        return this.languages.data.find(i => i.id == this.selectedLanguage);
    }

    public changeLanguage(language: string) {
        this.selectedLanguage = language;
    }

    public submitSolution() {
        const { activeCourse, activeProblem, ace, selectedLanguage, languages } = this;
        if (!activeCourse || !activeProblem) {
            return;
        }

        const enabledLanguages = activeProblem.unittest
            ? languages.data.filter(i => i.id == activeProblem.reference.lang)
            : languages.data;

        if (!enabledLanguages.find(i => selectedLanguage == i.id)) {
            this.selectedLanguage = enabledLanguages[0].id;
            NotificationManager.error("Programming language not supported, switched to the first supported language", "Proramming Language error");
            return;
        }

        // public async Task SubmitSolution(string userId, string courseName, string courseYear, string problemId, string solution, string langId, bool useDocker)
        var message = [
            currentUser.id,
            activeCourse.course,
            activeCourse.year,
            activeProblem.id,
            ace.editor.getValue(),
            selectedLanguage,
            true
        ];
        liveConnection.invoke("SubmitSolution", ...message);
    }

    public generateInput() {
        const { activeCourse, activeProblem } = this;
        if (!activeCourse || !activeProblem) {
            return;
        }

        // public async Task GenerateInput(string userId, string courseName, string courseYear, string problemId)
        var message = [
            currentUser.id,
            activeCourse.course,
            activeCourse.year,
            activeProblem.id,
        ];
        liveConnection.invoke("GenerateInput", ...message);
    }

    public generateOutput() {
        const { activeCourse, activeProblem } = this;
        if (!activeCourse || !activeProblem) {
            return;
        }

        // public async Task GenerateOutput(string userId, string courseName, string courseYear, string problemId)
        var message = [
            currentUser.id,
            activeCourse.course,
            activeCourse.year,
            activeProblem.id,
        ];
        liveConnection.invoke("GenerateOutput", ...message);
    }

    public openResultDialog() {
        this.resultsDialogOpen = true;
    }

    render() {
        const { model, languages, selectedLanguage, prefferedCode } = this;
        const { history } = this.props;
        const { activeCourse } = this;

        if (model.courses.isLoading) {
            return <Container>
                <CourseProblemSelect prefix="courses" model={model} history={history} {...this.props.match.params} />
            </Container>
        }

        const { activeProblem } = this;
        if (model.problems.isLoading || !activeProblem) {
            return <Container>
                <CourseProblemSelect prefix="courses" model={model} history={history} {...this.props.match.params} />
            </Container>
        }

        if (languages.isLoading) {
            return <Container>
                <CourseProblemSelect prefix="courses" model={model} history={history} {...this.props.match.params} />
                <SimpleLoader></SimpleLoader>
            </Container>
        }

        const { currentLanguage, resultsDialogOpen, liveResult, forcedResultId } = this;
        const enabledLanguages = activeProblem.unittest
            ? languages.data.filter(i => i.id == activeProblem.reference.lang)
            : languages.data;

        return <>
            <Suspense fallback={<div>Loading...</div>}>
                <Container>

                    <CourseProblemSelect prefix="courses" model={model} history={history} {...this.props.match.params} />

                    <Grid container spacing={2}>

                        {liveResult && <Grid item xs={12} sm={12} lg={12}>
                            <StudentResultItem
                                item={liveResult}
                                languages={languages.data}
                                onClick={() => {
                                    this.forcedResultId = liveResult.objectId
                                    this.openResultDialog()
                                }}
                            />
                        </Grid>}

                        <Grid item xs={12} sm={12} lg={6}>
                            <div className="description" dangerouslySetInnerHTML={{ __html: activeProblem.description }}>
                            </div>
                        </Grid>

                        <Grid item xs={12} sm={12} lg={6}>
                            {currentUser.role === "root" && activeProblem.unittest === false &&
                                <ButtonGroup size="large" fullWidth>
                                    <Button startIcon={<AddCircleOutlineOutlinedIcon />} onClick={() => this.generateInput()}>
                                        Generate Input
                                    </Button>
                                    <Button endIcon={<CheckCircleOutlinedIcon />} onClick={() => this.generateOutput()}>
                                        Generate Output
                                    </Button>
                                </ButtonGroup>
                            }

                            <Grid container spacing={3}>
                                <SolutionSubmitForm
                                    enabledLanguages={enabledLanguages}
                                    languages={languages.data}
                                    selectedLanguage={selectedLanguage}
                                    currentLanguage={currentLanguage}
                                    prefferedCode={prefferedCode}
                                    onLanguageChange={i => this.changeLanguage(i)}
                                    onEditorChange={i => this.debounceChange(i)}
                                    onEditorRef={i => this.ace = i}
                                    onFileChange={files => this.handleNewFiles(files)}
                                    activeProblem={activeProblem}
                                />

                                <Grid item xs={12} container className="button bar" justify="space-between">
                                    <Button onClick={() => this.openResultDialog()}
                                        size="large" variant="outlined" color="secondary" endIcon={<BubbleChartIcon />}>
                                        View Results
                                    </Button>
                                    {(resultsDialogOpen && activeCourse && activeProblem) &&
                                        <StudentResultsDialog
                                            onClose={() => {
                                                this.resultsDialogOpen = false;
                                                this.forcedResultId = "";
                                            }}
                                            languages={languages.data}
                                            activeCourse={activeCourse}
                                            activeProblem={activeProblem}
                                            forcedResultId={forcedResultId}
                                        />
                                    }
                                    <Button size="large" variant="contained" color="primary" endIcon={<SendIcon />}
                                        onClick={() => this.submitSolution()}>
                                        Submit Solution
                                    </Button>
                                </Grid>

                            </Grid>
                        </Grid>
                    </Grid>
                </Container>
            </Suspense>
        </>
    }
}