import React from "react";
import { observer } from "mobx-react"
import { observable, action } from "mobx"
import "react-table/react-table.css";
import { httpClient } from "../init";
import Highlight from 'react-highlight'
import 'highlight.js/styles/github.css';


class StudentResultDetailModel {
    constructor(private objectId: string) {
    }

    public data?: ICcData;
    @observable isLoading: boolean = false;

    @action.bound
    public load() {
        this.isLoading = true;
        httpClient.fetch(`student-result-list/${this.objectId}`)
            .then((data: ICcData) => {
                this.data = data;
                this.isLoading = false;
            });
    }
}

const mapLanguage = (id: string): string => {
    switch(id.toLowerCase()) {
        case "py-367":
            return "python";
        case "py-276":;
            return "python";
        case "c":
        case "cpp":
            return "cpp";
        default:
            return id.toLowerCase();
    }
}

interface StudentResultDetailState {
    model?: StudentResultDetailModel;
    columnsToCopy: any;
}


@observer
export class StudentResultDetail extends React.Component<any, StudentResultDetailState, any> {
    public model: StudentResultDetailModel;
    public columnsToCopy: any = {};

    constructor(props: any) {
        super(props);
        this.model = new StudentResultDetailModel(
            this.props.match.params.id
        );
        this.model.load();
    }

    render() {
        const { model } = this;

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