import * as H from 'history';
import { observable, computed } from "mobx";
import { observer } from "mobx-react";
import React from "react";
import ReactAce from 'react-ace-editor';
import { Form } from "react-bootstrap";
import { reactLocalStorage } from 'reactjs-localstorage';
import { debounce } from 'throttle-debounce';
import { CourseProblemSelect, ICourseYearProblem, RouteComponentProps } from "../components/CourseProblemSelect";
import { CourseProblemSelectModel } from "../components/CourseProblemSelect.Model";
import { SimpleLoader } from "../components/SimpleLoader";
import { ILanguage } from "../models/DataModel";
import { ApiResource } from "../utils/ApiResource";

interface SolutionSubmitProps extends RouteComponentProps<ICourseYearProblem> {
}


const mapLanguage = (id: string) => {
    return {
        CS: "csharp",
        C: "c_cpp",
        CC: "c_cpp",
        JAVA: "java",
        "PY-267": "python",
        "PY-367": "python",
    }[id] || "java";
}



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

    render() {
        const { model } = this;
        const { history } = this.props

        if (model.courses.isLoading) {
            return <>
                <CourseProblemSelect prefix="courses" model={model} history={history} {...this.props.match.params} />
            </>
        }


        if (model.problems.isLoading || !this.activeProblem) {
            return <>
                <CourseProblemSelect prefix="courses" model={model} history={history} {...this.props.match.params} />
            </>
        }

        if (this.languages.isLoading) {
            return <>
                <CourseProblemSelect prefix="courses" model={model} history={history} {...this.props.match.params} />
                <SimpleLoader></SimpleLoader>
            </>
        }

        return <>
            <CourseProblemSelect prefix="courses" model={model} history={history} {...this.props.match.params} />

            <div className="description" dangerouslySetInnerHTML={{ __html: this.activeProblem.description }}>
            </div>

            <Form.Group>
                <Form.Label>Select Language</Form.Label>
                <Form.Control as="select"
                    onChange={(e) => this.selectedLanguage = (e as any).target.value}
                    value={this.selectedLanguage}>
                    {this.languages.data
                        .filter(i => !i.disabled)
                        .map(i => <option key={i.id} value={i.id}>{i.name} ({i.version})</option>
                        )}
                </Form.Control>
            </Form.Group>

            <ReactAce
                mode={mapLanguage(this.selectedLanguage)}
                theme="eclipse"
                setReadOnly={false}
                onChange={i => this.onChange(i)}
                setValue={this.prefferedCode}
                style={{ height: "400px" }}
                ref={i => this.ace = i}
            />
        </>
    }
}