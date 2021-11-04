import moment from 'moment';
import React from 'react';
import { nameof } from 'ts-simple-nameof';

import { Tooltip } from '@mui/material';
import {
    GridCellParams, GridCellValue, GridColDef,
} from '@mui/x-data-grid';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CommentIcon from '@mui/icons-material/Comment';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import RateReviewIcon from '@mui/icons-material/RateReview';
import TimerIcon from '@mui/icons-material/Timer';
import TodayIcon from '@mui/icons-material/Today';

import { ICcDataDto } from '../../cc-api';
import { OptionType } from '../../models/CustomModel';
import { ProcessStatusStatic } from '../../models/Enums';
import { AbsMoment } from '../../renderers/AbsMoment';
import { languages } from '../../static/languages';

const XS = 80;
const SM = 100;
const MD = 140;

export interface GridColDefEx extends GridColDef {
    options?: OptionType[],
    strict?: boolean,
    isHiddenOnSmallScreen?: boolean,
}

const convert = (options: string[]) => options.map(i => {
    return { name: i, value: i } as OptionType
})
const OnlyYesNoAll = {
    strict: true,
    options: convert(["yes", "no", "all"])
}
const InLateAll = {
    strict: true,
    options: convert(["InTime", "Late", "all"])
}
const Languages = {
    strict: true,
    options: languages.map(i => {
        return { name: i.name, value: i.id }
    }) as OptionType[]
}
const now = moment();
const DateRange = {
    strict: true,
    options: [
        { name: "today", value: moment(now).subtract(1, 'days').unix() },
        { name: "3 days", value: moment(now).subtract(3, 'days').unix() },
        { name: "week", value: moment(now).subtract(7, 'days').unix() },
        { name: "2 weeks", value: moment(now).subtract(14, 'days').unix() },
        { name: "month", value: moment(now).subtract(31, 'days').unix() },
        { name: "3 months", value: moment(now).subtract(93, 'days').unix() },
    ] as OptionType[]
}

const Statuses = {
    strict: true,
    options: ProcessStatusStatic.All.map(i => {
        return { name: i.description, value: i.value }
    }) as OptionType[]
}

const Attempts = {
    strict: true,
    options: [
        { name: "(1) The best solution from each student", value: "1" },
        { name: "(3) Top 3 solutions from each student", value: "3" },
        { name: "(5) Top 5 solutions from each student", value: "5" },
    ] as OptionType[]
}

export const columns: GridColDefEx[] = [
    {
        field: nameof<ICcDataDto>(i => i.attempt), headerName: '#', width: XS, ...Attempts,
        renderHeader: () => <Tooltip title="Attempt no." ><FingerprintIcon /></Tooltip>,
        isHiddenOnSmallScreen: true,
    },
    {
        field: nameof<ICcDataDto>(i => i.date), headerName: 'Date', width: MD,
        renderCell: (params: any) => <AbsMoment date={params.row.date} />,
        renderHeader: () => <><TodayIcon />&nbsp;Date</>,
        sortComparator: (_v1: GridCellValue, _v2: GridCellValue, cellParams1: GridCellParams, cellParams2: GridCellParams) =>
            new Date(cellParams2.row.date).getTime() - new Date(cellParams1.row.date).getTime(),
        ...DateRange
    },
    { field: nameof<ICcDataDto>(i => i.isLate), headerName: 'is Late', width: SM, ...InLateAll },
    { field: nameof<ICcDataDto>(i => i.users), headerName: 'User', width: MD, },
    {
        field: nameof<ICcDataDto>(i => i.language), headerName: 'Lang', width: SM,
        isHiddenOnSmallScreen: true,
        ...Languages
    },
    {
        field: nameof<ICcDataDto>(i => i.course), headerName: 'Course', width: SM,
        isHiddenOnSmallScreen: true
    },
    {
        field: nameof<ICcDataDto>(i => i.year), headerName: 'Year', width: SM,
        isHiddenOnSmallScreen: true
    },
    {
        field: nameof<ICcDataDto>(i => i.problem), headerName: 'Problem', width: MD,
        isHiddenOnSmallScreen: true
    },
    {
        field: nameof<ICcDataDto>(i => i.reviewRequest), headerName: 'RR', width: MD, ...OnlyYesNoAll,
        renderCell: (params: any) => <AbsMoment date={params.row.reviewRequest} />,
        renderHeader: () => <><RateReviewIcon />&nbsp;Review</>,
    },
    {
        field: nameof<ICcDataDto>(i => i.comments), headerName: 'Comments', width: XS, ...OnlyYesNoAll,
        renderHeader: () => <Tooltip title="no. of comments" ><CommentIcon /></Tooltip>,
    },
    { field: nameof<ICcDataDto>(i => i.score), headerName: 'Score', width: SM },
    {
        field: nameof<ICcDataDto>(i => i.points), headerName: 'Points', width: XS,
        renderHeader: () => <Tooltip title="Points" ><AssessmentIcon /></Tooltip>,
    },
    { field: nameof<ICcDataDto>(i => i.status), headerName: 'Status', width: SM, ...Statuses },
    { field: nameof<ICcDataDto>(i => i.group), headerName: 'Group', width: SM },
    {
        field: nameof<ICcDataDto>(i => i.duration), headerName: 'Duration', width: SM,
        renderCell: (i: any) => i.row.duration?.toFixed(3),
        renderHeader: () => <Tooltip title="Duration" ><TimerIcon /></Tooltip>,
    },
].map(i => {
    return {
        ...i,
        disableColumnMenu: true,
        filterable: false,
        cellClassName: (params: any) => {
            /*GridCellClassParams*/
            const status = ProcessStatusStatic.All.find(i => i.letter == params.row.status);
            return `status-${status.name}`;
        },
    } as GridColDefEx
});