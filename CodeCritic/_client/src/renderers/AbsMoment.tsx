import Moment from 'react-moment';
import React from "react";
import { Tooltip } from "@material-ui/core";
import moment from 'moment';

interface AbsMomentProps {
    date: any;
}
export const AbsMoment = (props: AbsMomentProps) => {
    const { date } = props;
    const datetime = moment(date);

    return (<Tooltip title={datetime.format('llll')}>
        <Moment date={date} fromNow />
    </Tooltip>)
}