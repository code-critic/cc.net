import React from "react";
import { ApiResource } from "../utils/ApiResource";
import { ICcData, ILanguage, ICcDataResult } from "../models/DataModel";
import { SimpleLoader } from "./SimpleLoader";
import { observable } from "mobx";
import { observer } from "mobx-react";
import { StudentResultItem } from "./StudentResults.Item";

interface StudentResultsProps {
    course: string;
    year: string;
    problem: string;
    user: string;

    filters: any;

    languages: ILanguage[];
    forcedResultId?: string;
}

@observer
export default class StudentResults extends React.Component<StudentResultsProps, any, any> {

    @observable
    public results: ApiResource<ICcData> = new ApiResource<ICcData>("", false);

    @observable
    public detailResult?: ICcData;

    @observable
    public caseResult?: ICcData;
    @observable
    public caseSubresult?: ICcDataResult;

    constructor(props: StudentResultsProps) {
        super(props);
        const { course, year, problem, user } = this.props;
        this.results.load(`student-result-list/${course}/${year}/${problem}/${user}`);
    }


    render() {
        const { results } = this;
        const { languages, forcedResultId, filters } = this.props;
        
        if (results.isLoading) {
            return <SimpleLoader />
        }

        const filtered = (results.data ? results.data : [])
            .filter(i => filters.comments ? i.comments.length > 0 :  true)
            .filter(i => filters.review ? i.reviewRequest != null :  true);
        
        if (!filtered.length) {
            return "No results";
        }

        return <>
            {filtered.map(i => 
                <StudentResultItem key={i.objectId}
                    item={i}
                    languages={languages}
                    forceOpen={i.objectId == forcedResultId}
                />
            )}
        </>
    }
}