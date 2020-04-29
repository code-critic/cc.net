import React from "react";
import { ApiResource } from "../utils/ApiResource";
import { ICcData, ILanguage, ICcDataResult, ICcDataCaseResult } from "../models/DataModel";
import { observable } from "mobx";
import { observer } from "mobx-react";
import Moment from "react-moment";
import { ListItem, ListItemText, ListItemIcon, Dialog, Chip, Tooltip, DialogContent, Button, DialogTitle } from "@material-ui/core";

import CheckIcon from '@material-ui/icons/CheckCircle';
import CancelIcon from '@material-ui/icons/Cancel';
import { DiffView } from "./DiffView";
import { RenderSolution } from "../utils/renderers";

interface StudentResultItemProps {
    item: ICcData;
    languages: ILanguage[];
}

const isStatusOk = (status: string) =>
    !!~status.indexOf("correct") || !!~status.indexOf("status-ok");

@observer
export class StudentResultItem extends React.Component<StudentResultItemProps, any, any> {

    @observable
    public caseSubresult?: ICcDataCaseResult;

    @observable
    public sourceCode = false;

    render() {
        const { caseSubresult, sourceCode } = this;
        const { languages, item } = this.props;
        const { result, language: lang } = item;
        const { status } = result ? result : { status: "broken" };
        const language = languages.find(i => i.id == lang);
        const results = item.results || [];
        const scores = result ? result.scores : [0];

        return <div key={item.objectId} className="result-list">
            <ListItem button className={`status status-${status}`} onClick={() => this.sourceCode = true}>
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
                        <Tooltip key={`${item.objectId}-${j.case}`} enterDelay={0}
                            title={`${j.case} ended with ${j.status}`} arrow>
                            <Button className={`status status-${j.status}`} variant="text" onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
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


            {sourceCode &&
                <Dialog open={sourceCode} fullWidth maxWidth="lg"
                    onClose={() => this.sourceCode = false}>
                    <DialogTitle></DialogTitle>
                    <DialogContent>
                        <RenderSolution result={item} />
                    </DialogContent>
                </Dialog>
            }

            {caseSubresult &&
                <Dialog open={!!caseSubresult} fullWidth maxWidth="lg"
                    onClose={() => this.caseSubresult = undefined}>
                    <DialogTitle>#{item.attempt} {item.courseName}/{item.courseYear}/{item.problem}/{caseSubresult.case} - {caseSubresult.status}</DialogTitle>
                    <DialogContent>
                        <DiffView objectId={item.objectId} caseId={caseSubresult.case} />
                    </DialogContent>
                </Dialog>
            }
        </div>
    }
}