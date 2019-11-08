import React from "react";
import { observer } from "mobx-react"
import { observable, action } from "mobx"
import { httpClient } from "../init";
import Highlight from 'react-highlight'

import "../styles/detail.css";
import 'highlight.js/styles/github.css';


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
            this.load();
        }
    }
}

const mapLanguage = (id: string): string => {
    switch (id.toLowerCase()) {
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
    objectId?: string;
    match?: any;
}


@observer
export class StudentResultDetail extends React.Component<StudentResultDetailProps, StudentResultDetailState, any> {
    public model: StudentResultDetailModel;
    public columnsToCopy: any = {};

    constructor(props: any) {
        super(props);
        this.model = new StudentResultDetailModel();
        this.model.setObjectId(this.props.objectId || this.props.match.params.id);
    }

    render() {
        const { model } = this;

        model.setObjectId(this.props.objectId || this.props.match.params.id);

        if (model.isLoading || !model.data) {
            return <div>loading</div>
        }

        return (<div>
            <Highlight className={mapLanguage(model.data.lang)}>
                {model.data.solution}
            </Highlight>
        </div>);
    }
}