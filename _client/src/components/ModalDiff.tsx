import React from "react";
import { observer } from "mobx-react"
import { observable, action, $mobx } from "mobx"
import { httpClient } from "../init";
import { Modal, Button } from "react-bootstrap";
import { SimpleLoader } from "../components/SimpleLoader";
import { IDiffResult, IDiffPiece } from "../models/DataModel";


enum ChangeType {
    Unchanged = 0,
    Deleted = 1,
    Inserted = 2,
    Imaginary = 3,
    Modified = 4
}


export function renderDiff(result: IDiffResult) {
    return <div>
        <h3>{result.filename}</h3>
        <ul>
            {result.lines.map((line, index) => 
                renderDiffLine(line, index)
            )}
        </ul>
    </div>
}

export function renderDiffLine(line: IDiffPiece, index: number) {
    let cls = "";
    switch(line.type as any) {
        case ChangeType.Unchanged:
            cls = "";
            break;
        case ChangeType.Inserted:
            cls = "inserted";
            break;
        case ChangeType.Deleted:
            cls = "deleted";
            break;
    }
    return <li key={index} className={cls}>{line.text}</li>;
}

export interface ModalDiffProps {
    objectId: string;
    show: boolean;
    onCloseModal: () => void;
}

export class ModalDiffModel {
    @observable
    public data: IDiffResult[] = [];
    private objectId: string = "";

    viewDiff(objectId: string) {
        if(this.objectId != objectId) {
            this.objectId = objectId;

            httpClient.fetch(`diff/${objectId}`)
            .then((data: IDiffResult[]) => {
                this.data = data;
            });
        }
    }
}

@observer
export class ModalDiff extends React.Component<ModalDiffProps, any, any> {
    private model: ModalDiffModel = new ModalDiffModel();

    componentDidMount() {
        // console.log("componentDidMount");
    }

    componentDidUpdate() {
        const { show, objectId } = this.props;
        if (show && objectId) {
            this.model.viewDiff(objectId)
        }
    }

    render() {
        const { data } = this.model;
        
        if(!data) {
            return "nope";
        }

        return <>
            <Modal show={this.props.show}
                onHide={() => this.props.onCloseModal()}
                backdropClassName="on-top"
                className="on-top"
                size="xl"
                scrollable>

                <Modal.Header>Diff</Modal.Header>
                <Modal.Body className="diff">
                    {data.map((result: IDiffResult) => 
                        renderDiff(result)
                    )}
                </Modal.Body>
            </Modal>
        </>
    }
}