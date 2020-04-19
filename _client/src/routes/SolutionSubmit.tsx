import React from "react";
import * as H from 'history';

import { observable, computed } from "mobx";
import { observer } from "mobx-react";
import ReactAce from 'react-ace-editor';
import { Link as RouterLink } from "react-router-dom";
import { reactLocalStorage } from 'reactjs-localstorage';
import { debounce } from 'throttle-debounce';
import { CourseProblemSelect, ICourseYearProblem, RouteComponentProps } from "../components/CourseProblemSelect";
import { CourseProblemSelectModel } from "../components/CourseProblemSelect.Model";
import { SimpleLoader } from "../components/SimpleLoader";
import { ILanguage } from "../models/DataModel";
import { ApiResource } from "../utils/ApiResource";
import { Grid, Button, InputLabel, Select, MenuItem, FormControl, ButtonGroup, Dialog, DialogTitle, DialogContent, Tooltip, Container } from '@material-ui/core';


import SendIcon from '@material-ui/icons/Send';
import BubbleChartIcon from '@material-ui/icons/BubbleChart';
import HelpIcon from '@material-ui/icons/Help';

import LanguageExamples from '../utils/LanguageExamples';
import { mapLanguage } from '../utils/LanguageMap';
import StudentResults from "../components/StudentResults";
import { User } from "../init";
import { renderCode } from "../utils/renderers";


interface SolutionSubmitProps extends RouteComponentProps<ICourseYearProblem> {
}



const Adapt = ({ children, ...other }) => children(other);


interface LocalStorateCodeSnippet {
    code: string;
    date: Date,
    language: string;
}


@observer
export class SolutionSubmit extends React.Component<SolutionSubmitProps, any, any> {

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



    @computed
    private get prefferedCode() {
        const lastSolution: LocalStorateCodeSnippet = reactLocalStorage.getObject(this.problemLanguagePath);
        const code = lastSolution.code ? lastSolution.code : "";

        if (this.ace) {
            this.ace.editor.setValue(code);
        }
        return code;
    }

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
            .then(data => {
                if (!this.selectedLanguage) {
                    this.selectedLanguage = this.languages.data[0].id;
                }
            });
    }

    private onChange(state: any) {
        this.debounceChange(state);
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

    private debounceChange: (state: any) => void = debounce(300, false, (state: any) => {
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

    render() {
        const { model, languages } = this;
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

        const { currentLanguage, exampleDialogOpen, resultsDialogOpen } = this;

        return <Container>

            <CourseProblemSelect prefix="courses" model={model} history={history} {...this.props.match.params} />

            <Grid container spacing={2}>
                <Grid item xs={12} sm={12} lg={6} >
                    <div className="description" dangerouslySetInnerHTML={{ __html: activeProblem.description }}>
                    </div>
                </Grid>

                <Grid item xs={12} sm={12} lg={6} >
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <FormControl variant="outlined" fullWidth>
                                <InputLabel id="select-Language-label">Select Language</InputLabel>
                                <ButtonGroup fullWidth>
                                    <Adapt>
                                        {({ className, ...props }) => (
                                            <Select fullWidth labelId="select-language-label"
                                                className={className}
                                                id="select-language"
                                                label="Select Language"
                                                value={this.selectedLanguage}
                                                onChange={e => this.selectedLanguage = e.target.value as string}>
                                                {this.languages.data
                                                    .filter(i => !i.disabled)
                                                    .map(i => <MenuItem key={i.id} value={i.id}>{i.name} ({i.version})</MenuItem>
                                                    )}
                                            </Select>
                                        )}
                                    </Adapt>

                                    {currentLanguage &&
                                        <Tooltip title={`View Example in ${currentLanguage.name}`}>
                                            <Button size="small" variant="outlined" style={{ width: 70 }}
                                                onClick={() => this.exampleDialogOpen = !this.exampleDialogOpen}>
                                                <HelpIcon />
                                            </Button>
                                        </Tooltip>
                                    }
                                </ButtonGroup>
                                {(currentLanguage && this.exampleDialogOpen) &&
                                    <Dialog maxWidth="md"
                                        onClose={() => this.exampleDialogOpen = false}
                                        open={exampleDialogOpen}
                                        fullWidth>
                                        <DialogTitle>{currentLanguage.name}</DialogTitle>
                                        <DialogContent>
                                            {renderCode(
                                                LanguageExamples.examples[currentLanguage.id],
                                                mapLanguage(currentLanguage.id)
                                            )}
                                            <pre><code>
                                                {}
                                            </code></pre>
                                        </DialogContent>
                                    </Dialog>
                                }
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                            <FormControl variant="outlined" fullWidth>
                                <ReactAce
                                    id="source-code"
                                    mode={mapLanguage(this.selectedLanguage)}
                                    theme="eclipse"
                                    setReadOnly={false}
                                    onChange={i => this.onChange(i)}
                                    setValue={this.prefferedCode}
                                    style={{ height: "400px", width: "100%" }}
                                    ref={i => this.ace = i}
                                />
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} container className="button bar" justify="space-between">
                            <Button onClick={() => this.resultsDialogOpen = !this.resultsDialogOpen}
                                size="large" variant="outlined" color="secondary" endIcon={<BubbleChartIcon />}>
                                View Results
                            </Button>
                            {(resultsDialogOpen && activeCourse && activeProblem) &&
                                < Dialog open={true} onClose={() => this.resultsDialogOpen = false} maxWidth="lg" fullWidth>
                                    <DialogTitle>{User.name}</DialogTitle>
                                    <DialogContent>
                                        <StudentResults
                                            course={activeCourse.course}
                                            year={activeCourse.year}
                                            problem={activeProblem.id}
                                            user={User.id}
                                            languages={languages.data}
                                        />
                                    </DialogContent>
                                </Dialog>
                            }

                            <Button size="large" variant="contained" color="primary" endIcon={<SendIcon />}>
                                Submit Solution
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Container >
    }
}