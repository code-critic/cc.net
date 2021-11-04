import Moment from 'react-moment';
import moment from 'moment';
import React from 'react';
import { Tooltip } from '@mui/material';

interface AbsMomentProps {
    date: any;
    noTooltip?: boolean;
}
export const AbsMoment = (props: AbsMomentProps) => {
    const { date, noTooltip } = props;
    
    if (!date) {
        return <></>
    }
    const datetime = moment(date);

    if (noTooltip) {
        return <><Moment date={date} fromNow /> (<Moment date={date} format="llll" />)</>
    }
    

    return (<Tooltip title={datetime.format('llll')}>
        <Moment date={date} fromNow />
    </Tooltip>)
}