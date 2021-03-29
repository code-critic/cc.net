import Moment from 'react-moment';
import moment from 'moment';
import React from 'react';
import { Tooltip } from '@material-ui/core';

interface AbsMomentProps {
    date: any;
}
export const AbsMoment = (props: AbsMomentProps) => {
    const { date } = props;
    
    if (!date) {
        return <></>
    }
    const datetime = moment(date);
    

    return (<Tooltip title={datetime.format('llll')}>
        <Moment date={date} fromNow />
    </Tooltip>)
}