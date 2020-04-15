import "code-prettify/src/prettify.css";
import { action, observable } from "mobx";
import { observer } from "mobx-react";
import React from "react";
// import Highlight from 'react-highlight'
import { Button, Modal } from "react-bootstrap";
import { ModalDiff } from "../components/ModalDiff";
import { SimpleLoader } from "../components/SimpleLoader";
import { httpClient } from "../init";
import { ICcData, IMarkSolutionItem } from "../models/DataModel";
// import hljs from 'highlight.js';
import "../styles/detail.css";
import "../third_party/prettify.js";
import { getPoints } from "../utils/DataUtils";

// import 'highlight.js/styles/github.css';


class StudentResultDetailModel {
    constructor(private objectId?: string) {
    }

    @observable isLoading: boolean = false;
    public data?: ICcData;

    @action.bound
    public load() {
        this.isLoading = true;
        httpClient.fetch(`student-result-list/${this.objectId}`)
            .then((data: ICcData) => {
                this.data = data;
                this.isLoading = false;
            });
    }

    @action.bound
    public setObjectId(objectId: string) {
        if (this.objectId !== objectId) {
            this.objectId = objectId;
            if (this.objectId) {
                this.load();
            }
        }
    }
}

const mapLanguage = (id?: string): string => {
    switch ((id = id || "").toLowerCase()) {
        case "py-367":
            return "python";
        case "py-276": ;
            return "python";
        case "c":
        case "cpp":
            return "cpp";
        default:
            return id.toLowerCase();
    }
}

export interface StudentResultDetailState {
    model?: StudentResultDetailModel;
}

export interface StudentResultDetailProps {
    objectId: string;
    match?: any;
    show: boolean;
    onCloseModal: (reload: boolean) => void;
}

declare global {
    interface PrettyCode {
        prettyPrintOne: (sourceCodeHtml: string, opt_langExtension: string, opt_numberLines: boolean) => string;
        prettyPrint: (opt_whenDone: Function, root: HTMLElement | HTMLDocument) => void;
    }

    interface Window {
        PR: PrettyCode;
    }
}

@observer
export class StudentResultDetail extends React.Component<StudentResultDetailProps, StudentResultDetailState, any> {
    public model: StudentResultDetailModel;

    public nameInput: HTMLInputElement | null = null;

    @observable
    public isDiffVisible: boolean = false;

    constructor(props: any) {
        super(props);
        this.model = new StudentResultDetailModel();
        this.model.setObjectId(this.props.objectId);
    }

    public closeModal = (reload: boolean = false) => {
        this.props.onCloseModal(reload);
    }

    public renderBody() {
        const { model } = this;
        if (model.isLoading || !model.data) {
            return <SimpleLoader />
        }
        // var html = hljs.highlightAuto(model.data.solution);
        // console.log(html);
        const code = window.PR.prettyPrintOne(model.data.solution, "java", true);
        return <>
            <div>
                <div className="line-actions"></div>
                <pre className="prettyprint linenums" dangerouslySetInnerHTML={{ __html: code }} />
            </div>
        </>;
    }

    public onCodeRowClicked(node: Element, line: number) {
        console.log(node);
    }

    componentDidMount() {
        if (this.nameInput) {
            this.nameInput.focus();
            this.nameInput.select();
        }
    }

    componentDidUpdate() {
        const { model } = this;
        if (model.isLoading || !model.data) {
            return;
        }
        if (this.nameInput) {
            this.nameInput.focus();
            this.nameInput.select();
        }
        // const lineList = window.document.querySelectorAll("ol.linenums > li");
        // const lines = lineList.length;
        // lineList.forEach((node, key) => {
        //     node.addEventListener('click', () => this.onCodeRowClicked(node, key));
        // });

        // const lineActions = window.document.querySelector('.line-actions');
        // const foo: number[] = [...(Array as any)(lines).keys()];
        // if (lineActions) {
        //     lineActions.innerHTML = foo.map(n => `<div>${n}</div>`).join('');
        // }
    }

    public savePoints() {
        const { model } = this;
        if (!model.isLoading && model.data) {
            httpClient.fetch(`mark-solution`, {
                objectId: model.data.objectId,
                points: model.data.points,
            } as IMarkSolutionItem)
                .then((data: any) => {
                    console.log(data);
                    this.closeModal(true);
                });
        }
    }

    public setPoints(value: number) {
        const { model } = this;

        if (!model.isLoading && model.data) {
            model.data.points = value;
        }
    }

    public handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") {
            this.savePoints();
        }
    }


    public showDiff() {
        if(!this.model || !this.model.data || !this.model.data.objectId) {
            return;
        }
        this.isDiffVisible = true;
    }

    public closeDiff() {
        this.isDiffVisible = false;
    }


    render() {
        const { model } = this;
        model.setObjectId(this.props.objectId);

        if (model.isLoading || !model.data) {
            return <></>
        }
        const { data } = model;

        const points = getPoints(data, -1);
        const notSaved = data.points !== points;
        data.points = points === -1 ? 0 : points;

        return (<>
            <Modal show={this.props.show} onHide={() => this.closeModal()} size="xl" scrollable>
                <Modal.Header closeButton>
                    <Modal.Title>
                        #{data.attempt} - {data.user} - <small>{data.objectId}</small>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <label htmlFor="solution-points">Score:&nbsp;</label>
                    <input id="solution-points"
                        onChange={e => this.setPoints(Number(e.target.value))}
                        onKeyDown={e => this.handleKeyDown(e)}
                        defaultValue={data.points}
                        ref={(input) => this.nameInput = input}
                        type="number">
                    </input>
                    {notSaved && <span>*</span>}
                    <Button size="sm" variant="outline-dark" onClick={() => this.showDiff()} >
                        Show diff
                    </Button>
                    <br />
                    {this.renderBody()}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-dark" onClick={() => this.showDiff()} >
                        Show diff
                    </Button>
                    <Button onClick={() => this.closeModal()}>
                        Close
                    </Button>
                    <Button variant="danger" onClick={(e) => this.savePoints()}>
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>
            <ModalDiff objectId={data.objectId}
                show={this.isDiffVisible}
                onCloseModal={() => this.closeDiff()}
            />
        </>);
    }
}