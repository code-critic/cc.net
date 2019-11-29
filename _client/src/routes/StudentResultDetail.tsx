import React from "react";
import { observer } from "mobx-react"
import { observable, action, $mobx } from "mobx"
import { httpClient } from "../init";
// import Highlight from 'react-highlight'
import { Modal, Button } from "react-bootstrap";
import { SimpleLoader } from "../components/SimpleLoader";

// import hljs from 'highlight.js';
import "../styles/detail.css";
import "code-prettify/src/prettify.css";
import "../third_party/prettify.js";
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
    onCloseModal: () => void;
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

    constructor(props: any) {
        super(props);
        this.model = new StudentResultDetailModel();
        this.model.setObjectId(this.props.objectId);
    }

    private closeModal = () => {
        this.props.onCloseModal();
    }

    private renderBody() {
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

    private onCodeRowClicked(node: Element, line: number) {
        console.log(node);
    }

    public componentDidUpdate() {
        const { model } = this;
        if (model.isLoading || !model.data) {
            return;
        }
        const lineList = window.document.querySelectorAll("ol.linenums > li");
        const lines = lineList.length;
        lineList.forEach((node, key) => {
            node.addEventListener('click', () => this.onCodeRowClicked(node, key));
        });

        const lineActions = window.document.querySelector('.line-actions');
        const foo: number[] = [...(Array as any)(lines).keys()];
        if (lineActions) {
            lineActions.innerHTML = foo.map(n => `<div>${n}</div>`).join('');
        }
    }

    render() {
        const { model } = this;
        model.setObjectId(this.props.objectId);

        return (<>
            <Modal show={this.props.show} onHide={() => this.closeModal()} size="xl" scrollable>
                <Modal.Header closeButton>
                    <Modal.Title>Modal heading</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {this.renderBody()}
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => this.closeModal()}>Close</Button>
                </Modal.Footer>
            </Modal>
        </>);
    }
}