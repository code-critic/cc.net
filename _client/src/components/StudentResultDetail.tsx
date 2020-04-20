import { action, observable } from "mobx";
import { observer } from "mobx-react";
import React from "react";
import { ICcData } from "../models/DataModel";
import { httpClient } from "../init";
import { SimpleLoader } from "./SimpleLoader";
import { renderCode, renderSolution } from "../utils/renderers";

interface StudentResultDetailProps {
    objectId?: string;

    result?: ICcData
}

@observer
export class StudentResultDetail extends React.Component<StudentResultDetailProps, any, any> {


    @observable
    isLoading: boolean = false;

    public data?: ICcData;

    @action.bound
    public load() {
        this.isLoading = true;
        httpClient.fetch(`student-result-list/${this.props.objectId}`)
            .then((data: ICcData) => {
                this.data = data;
                this.isLoading = false;
            });
    }

    constructor(props: StudentResultDetailProps) {
        super(props);
        if (props.objectId) {
            this.load();
        } else {
            this.data = props.result;
            this.isLoading = false;
        }
    }

    render() {
        const { isLoading, data } = this;
        
        if (isLoading || !data) {
            return <SimpleLoader />
        }

        return <div>
            {renderSolution(data)}
        </div>
    }
}