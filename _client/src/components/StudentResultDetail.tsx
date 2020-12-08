import React from "react";
import "code-prettify/src/prettify.css";
import "code-prettify/src/prettify.js";
import "code-prettify/src/lang-matlab.js";
import "../styles/detail.css";
import { ICcData } from "../models/DataModel";
import { httpClient } from "../init";
import { SimpleLoader } from "./SimpleLoader";
import { RenderSolution } from "../utils/renderers";



interface StudentResultDetailProps {
    objectId?: string;
}

export const StudentResultDetail = (props: StudentResultDetailProps) => {
    const { objectId } = props;
    const [data, setData] = React.useState<ICcData>();
    React.useEffect(() => {
        if (!data || data.objectId !== objectId) {
            httpClient.fetch(`student-result-list/${objectId}`)
                .then((data: ICcData) => {
                    setData(data);
                });
        }
    }, [objectId]);

    if (!data) {
        return <SimpleLoader />
    }

    return <div>
        <RenderSolution result={data} />
    </div>
}

/*@observer
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
        console.log("ctor");

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
            <RenderSolution result={data} />
        </div>
    }
}*/