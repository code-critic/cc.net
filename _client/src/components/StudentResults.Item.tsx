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

interface StudentResultItemProps {
    item: ICcData;
    languages: ILanguage[];
}

const isStatusOk = (status: string) =>
    !!~status.indexOf("correct") || !!~status.indexOf("status-ok");

export default class StudentResultItem extends React.Component<StudentResultItemProps, any, any> {
    render() {
        const { languages, item } = this.props;
        const { result, lang } = item;
        const { status } = result ? result : { status: "broken" };
        const language = languages.find(i => i.id == lang);
        const results = item.results || [];
        const scores = result ? result.scores : [0];

        return <div key={item.objectId} className="result-list">
            <ListItem button className={`status status-${status}`}>
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
                            <Button className={`status status-${j.status}`} variant="text">
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
}