import React from "react";
import { ApiResource } from "../utils/ApiResource";
import { ICcData, ILanguage, ICcDataResult, ICcDataCaseResult } from "../models/DataModel";
import { observable } from "mobx";
import { observer } from "mobx-react";
import Moment from "react-moment";
import { ListItem, ListItemText, ListItemIcon, Dialog, Chip, Tooltip, DialogContent, Button, DialogTitle, CircularProgress, Grid, Typography, Box, ButtonGroup } from "@material-ui/core";

import CheckIcon from '@material-ui/icons/CheckCircle';
import CancelIcon from '@material-ui/icons/Cancel';
import { DiffView } from "./DiffView";
import { RenderSolution, renderCode, Grow, Tiny } from "../utils/renderers";
import { isStatusOk, getStatus } from "../utils/StatusUtils";
import { ProcessStatusCodes } from "../models/Enums";
import CloseIcon from '@material-ui/icons/Close';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import { NotificationManager } from 'react-notifications';
import { httpClient } from "../init";



interface StudentResultItemProps {
    item: ICcData;
    languages: ILanguage[];

    onClick?: () => void;
    forceOpen?: boolean;
}

@observer
export class StudentResultItem extends React.Component<StudentResultItemProps, any, any> {

    @observable
    public caseSubresult?: ICcDataCaseResult;

    @observable
    public sourceCode = false;

    @observable
    public showMessages: boolean = false;

    constructor(props: StudentResultItemProps) {
        super(props);
        this.sourceCode = this.props.forceOpen ? true : false;
        this.showMessages = this.resultStatus.code == ProcessStatusCodes.ErrorWhileRunning;

    }

    public getIcon(status: number, size = 24) {
        switch (isStatusOk(status)) {
            case 1:
                return <CheckIcon />
            case 2:
                return <CircularProgress size={size} />
            default:
                return <CancelIcon />
        }
    }

    public overrideClick(e: React.MouseEvent<HTMLButtonElement, MouseEvent>, func: () => void) {
        e.stopPropagation();
        e.preventDefault();
        func();
    }

    public get resultStatus() {
        const { result } = this.props.item;
        const { status } = result ? result : { status: ProcessStatusCodes.ErrorWhileRunning };
        return getStatus(status);
    }

    public get resultLanguage() {
        const { languages } = this.props;
        const { language } = this.props.item;
        const lang = languages.find(i => i.id == language);
        return lang;
    }

    renderSubresult(subresult: ICcDataCaseResult, index: number) {
        const statusInstance = getStatus(subresult.status);

        return <Tooltip
            key={index} enterDelay={0}
            title={`${subresult.case}: ${statusInstance.description}`} arrow>
            <Button className={`status status-${statusInstance.name}`} variant="text"
                onClick={(e) => this.overrideClick(e, () => this.caseSubresult = subresult)}>
                <span>
                    {this.getIcon(subresult.status)}
                </span>
            </Button>
        </Tooltip>
    }

    renderRow() {
        const { resultStatus, resultLanguage, showMessages } = this;
        const { item: { id, attempt, result, results } } = this.props;

        const scores = result ? result.scores : [0];
        const messages = !result.messages ? [] : result.messages;
        const hasMessages = messages.length > 0;

        return <>
            <Grid container direction="row" alignItems="center">
                <ListItemIcon className="bigger">{this.getIcon(resultStatus.code, 36)}</ListItemIcon>
                <ListItemText style={{ maxWidth: 300 }}
                    primary={<>
                        Attempt #{attempt}
                    </>}
                    secondary={<>
                        <Moment fromNow>{id.creationTime.toString()}</Moment>,
                        using {resultLanguage ? resultLanguage.name : "no language"}
                    </>}
                />
                <ListItemText
                    primary={resultStatus.description}
                />
                <Grid item style={{ display: "flex", flexDirection: "column" }} className="right-side">
                    <Grid item>
                        <span className="subresult">
                            {results.map((j, i) => this.renderSubresult(j, i))}
                        </span>

                        <Chip className={`chip-${resultStatus.name}`} size="small" label={scores.join("-")} />
                    </Grid>
                    <Grid item>
                        <Typography variant="body2" color="textSecondary" className="font-code">
                            Total Duration: {result.duration.toFixed(3)} sec
                    </Typography>
                    </Grid>
                </Grid>
                <Grid item style={{ display: "flex", flexDirection: "row", alignContent: "stretch", height: "100%", marginLeft: 10 }}>
                    <Button disabled={!hasMessages} className={`status status-${resultStatus.name}`} variant="text" style={{ height: "100%" }}
                        onClick={(e) => this.overrideClick(e, () => this.showMessages = !this.showMessages)}>
                        <ExpandMoreIcon className={showMessages ? "expand-icon expanded" : "collapsed expand-icon "} />
                    </Button>
                </Grid>
            </Grid>
            <Grid item style={{ paddingLeft: 72 }} container direction="column"
                className={showMessages ? "expand-content expanded" : "expand-content collapsed"}>
                <pre>{renderCode(messages.join("\n"))}</pre>
            </Grid>
        </>
    }

    requestCodeReview() {
        const { item } = this.props;
        httpClient
            .fetch(`reviewrequest/${item.objectId}`)
            .then(data => {
                const { status, updated } = data;
                if (status === "ok") {
                    NotificationManager.success(`Ok, Teacher(s) have been notified`);
                    this.props.item.reviewRequest = new Date();
                    this.setState({ reviewRequest: new Date() });
                } else {
                    NotificationManager.error(`Failed notify Teacher(s) comments`);
                }
            });
    }

    cancelCodeReview() {
        const { item } = this.props;
        httpClient
            .fetch(`reviewrequest/${item.objectId}`, null, "delete")
            .then(data => {
                const { status, updated } = data;
                if (status === "ok") {
                    NotificationManager.success(`Ok, review request cancelled`);
                    this.props.item.reviewRequest = null as any;
                    this.setState({ reviewRequest: undefined});
                } else {
                    NotificationManager.error(`Could not cancel the operation`);
                }
            });
    }

    render() {
        const { caseSubresult, sourceCode, resultStatus } = this;
        const { item, onClick } = this.props;
        const hasComment = item.comments != null && item.comments.length > 0 ? "with-comment" : "";
        const hasReview = item.reviewRequest != null ? "with-review" : "";

        const handleClick = onClick
            ? onClick
            : () => this.sourceCode = true;

        return <div key={item.objectId} className={`result-item ${hasComment} ${hasReview}`}>
            <ListItem button className={`status status-${resultStatus.name}`} onClick={() => handleClick()}>
                <Grid container direction="row">
                    {this.renderRow()}
                </Grid>
            </ListItem>


            {sourceCode &&
                <Dialog open={sourceCode} fullWidth maxWidth="lg"
                    onClose={() => this.sourceCode = false}>
                    <DialogTitle className="text-right">
                        <Box className="dialog-title">
                            <div>
                                <ButtonGroup variant="contained" color="primary">
                                    <Button
                                        disabled={!!item.reviewRequest}
                                        onClick={() => this.requestCodeReview()}>
                                        Request Code Review
                                    </Button>
                                {item.reviewRequest &&
                                    <Button onClick={() => this.cancelCodeReview()}><CloseIcon /></Button>
                                }
                                </ButtonGroup>
                                {item.reviewRequest &&
                                    <Tiny>
                                        Requested: <Moment locale="div" date={item.reviewRequest} calendar />
                                    </Tiny>
                                }
                            </div>
                            <Grow />
                            <Button onClick={() => this.sourceCode = false}><CloseIcon /></Button>
                        </Box>
                    </DialogTitle>
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