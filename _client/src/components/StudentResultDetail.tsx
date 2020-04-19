import { action, observable } from "mobx";
import { observer } from "mobx-react";
import React from "react";
import { ICcData } from "../models/DataModel";
import { httpClient } from "../init";
import { SimpleLoader } from "./SimpleLoader";
import { renderCode } from "../utils/renderers";

interface StudentResultDetailProps {
    objectId?: string;

    result?: ICcData
}

export class StudentResultDetail extends React.Component<StudentResultDetailProps, any, any> {


    @observable isLoading: boolean = false;
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

    public renderCode(code: string, language: string, lineNumbers: boolean = false) {
        const html = window.PR.prettyPrintOne(code, language, true);
        return <>
            <div>
                <div className="line-actions"></div>
                <pre className={`prettyprint  no-hover-effect ${lineNumbers ? "" : "no-line-numbers"}`} dangerouslySetInnerHTML={{ __html: html }} />
            </div>
        </>;
    }


    render() {
        const { isLoading, data } = this;
        
        if (isLoading || !data) {
            return <SimpleLoader />
        }

        return <div>
            {renderCode(data.solution, data.lang)}
        </div>
    }
}