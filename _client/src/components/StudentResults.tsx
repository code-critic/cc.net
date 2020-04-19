import React from "react";
import { ApiResource } from "../utils/ApiResource";
import { ICcData, ILanguage, ICcDataResult } from "../models/DataModel";
import { SimpleLoader } from "./SimpleLoader";
import { observable } from "mobx";
import { observer } from "mobx-react";
import Moment from "react-moment";
import { ListItem, ListItemText, ListItemIcon, Dialog, Chip, Tooltip, DialogContent, Button, DialogTitle } from "@material-ui/core";

import CheckIcon from '@material-ui/icons/CheckCircle';
import CancelIcon from '@material-ui/icons/Cancel';
import { StudentResultDetail } from "./StudentResultDetail";

interface StudentResultsProps {
    course: string;
    year: string;
    problem: string;
    user: string;
    languages: ILanguage[];
}

const isStatusOk = (status: string) =>
    !!~status.indexOf("correct") || !!~status.indexOf("status-ok");

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


    renderResult(item: ICcData) {
        const { languages } = this.props;
        const { result, lang } = item;
        const { status } = result ? result : { status: "broken" };
        const language = languages.find(i => i.id == lang);
        const results = item.results || [];
        const scores = result ? result.scores : [0];

        return <div key={item.objectId} className="result-list">
            <ListItem button className={`status status-${status}`} onClick={() => this.detailResult = item}>
                <ListItemIcon className="bigger">
                    {isStatusOk(status) ? <CheckIcon /> : <CancelIcon />}
                </ListItemIcon>
                <ListItemText
                    primary={<>
                        Attempt #{item.attempt} written in {language ? language.name : ""}
                    </>}
                    secondary={<Moment fromNow>{item.id.creationTime.toString()}</Moment>}
                />
                <span className="subresult">
                    {results.map(j =>
                        <Tooltip key={`${item.objectId}-${j.caseId}`} enterDelay={0}
                            title={`${j.caseId} ended with ${j.status}`}  arrow>
                            <Button className={`status status-${j.status}`} variant="text" onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                this.caseResult = item;
                                this.caseSubresult = j;
                            }}>
                                <span className="">
                                    {isStatusOk(j.status) ? <CheckIcon /> : <CancelIcon />}
                                </span>
                            </Button>
                        </Tooltip>
                    )}
                </span>
                <Chip className={`chip-${status}`} size="small" label={scores.join("-")} />
            </ListItem>
        </div>
    }
    render() {
        const { results, detailResult: detailObject, caseResult, caseSubresult } = this;
        if (results.isLoading) {
            return <SimpleLoader />
        }

        return <>
            {results.data.map(i => this.renderResult(i))}
            {detailObject &&
                <Dialog open={!!detailObject} fullWidth maxWidth="lg"
                    onClose={() => this.detailResult = undefined}>
                    <DialogContent>
                        <StudentResultDetail
                            result={detailObject}
                        />
                    </DialogContent>
                </Dialog>}

            {(caseResult && caseSubresult) &&
                <Dialog open={!!caseSubresult} fullWidth maxWidth="lg"
                    onClose={() => this.caseSubresult = undefined}>
                    <DialogTitle>{caseSubresult.caseId} - {caseSubresult.status}</DialogTitle>
                    <DialogContent>
                    </DialogContent>
                </Dialog>
            }
        </>
    }
}