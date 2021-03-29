import moment from 'moment';
import Moment from 'react-moment';
import React from 'react';
import { Column } from 'react-table';
import { ICcData, ICcDataResult, ICourse } from '../models/DataModel';
import { nameof } from 'ts-simple-nameof';
import { ProcessStatusCodes, ProcessStatusStatic, SubmissionStatus } from '../models/Enums';
import { StudentResultListModel } from './StudentResultList.Model';
// import 'react-table/react-table.css';


export function getStatusOrDefault(result: ICcDataResult) {
    if (result && result.status) {
        const status = ProcessStatusStatic.All.find(i => i.code === result.status);
        return status ? status.name : "unknown";
    } else {
        return "unknown";
    }
}

export function getStatus(result: ICcDataResult) {
    return `status-${getStatusOrDefault(result)}`;
}

interface DateRange {
    name: string,
    value: number;
}

const now = moment();
const dateRanges: DateRange[] = [
    { name: "today", value: moment(now).subtract(1, 'days').unix() },
    { name: "3 days", value: moment(now).subtract(3, 'days').unix() },
    { name: "week", value: moment(now).subtract(7, 'days').unix() },
    { name: "2 weeks", value: moment(now).subtract(14, 'days').unix() },
    { name: "month", value: moment(now).subtract(31, 'days').unix() },
    { name: "3 months", value: moment(now).subtract(93, 'days').unix() },
];

const statuses = ProcessStatusStatic.All.map(i => {
    return {key: `[${i.letter}] - ${i.description}`, value: i.code }
});


function statusRenderer(any: any) {
    var data = any.value as ICcDataResult;
    if (!data) {
        return "";
    }
    var val: number[] = data.scores;
    if (!val || val.length !== 3) {
        return "";
    }
    return (<span className="score-result score-result-small">
        <span className="score-result-0">{val[0]}</span>-
        <span className="score-result-1">{val[1]}</span>-
        <span className="score-result-2">{val[2]}</span>
    </span>);
}

export function getColumns(model: StudentResultListModel, courses: ICourse[], showFilters: boolean = true) {
    var cols = [
        {
            Header: () => "#",
            accessor: nameof<ICcData>(i => i.attempt),
            maxWidth: 70,
            Filter: (params: { column: Column, filter: any, onChange: any, key?: string }) =>
                <select onChange={event => params.onChange(event.target.value)} style={{ width: "100%" }}
                    value={params.filter ? params.filter.value : "all"}>
                    <option value="all">∞</option>
                    <option value="1">(1) The best solution from each student</option>
                    <option value="3">(3) Top 3 solutions from each student</option>
                    <option value="5">(5) Top 5 solutions from each student</option>
                </select>
        },
        {
            Header: () => "Date",
            accessor: "id.timestamp",
            Cell: (any: any) =>
                <Moment date={any.value * 1000} fromNow />,
            filterMethod: (filter: any, row: ICcData) => {
                if (filter.value === "all") {
                    return true;
                }
                return getStatusOrDefault(row.result) === filter.value;
            },
            Filter: (params: { column: Column, filter: any, onChange: any, key?: string }) =>
                <select onChange={event => params.onChange(event.target.value)} style={{ width: "100%" }}
                    value={params.filter ? params.filter.value : "all"}>
                    <option value="all">Show All</option>
                    {dateRanges.map(l => <option key={l.value} value={l.value}>{l.name}</option>)}
                </select>
        },
        {
            Header: "Late submission",
            accessor: "submissionStatus",
            Filter: (params: { column: Column, filter: any, onChange: any, key?: string }) =>
                <select onChange={event => params.onChange(event.target.value)} style={{ width: "100%" }}
                    value={params.filter ? params.filter.value : "all"}>
                    <option value="all">Show All</option>
                    <option value={SubmissionStatus.Intime}>IN(time)</option>
                    <option value={SubmissionStatus.Late}>AF(ter)</option>
                    <option value={SubmissionStatus.None}>NO(ne)</option>
                </select>,
            Cell: (any: any) =>
                any.value == SubmissionStatus.Intime
                    ? "IN"
                    : any.value == SubmissionStatus.Late
                        ? "AF"
                        : any.value == SubmissionStatus.None
                            ? "NO"
                            : ""
        },
        {
            Header: "User",
            accessor: nameof<ICcData>(i => i.user),
        },
        {
            Header: "Language",
            accessor: nameof<ICcData>(i => i.language),
            filterMethod: (filter: any, row: ICcData) => {
                if (filter.value === "all") {
                    return true;
                }
                return getStatusOrDefault(row.result) === filter.value;
            },
            Filter: (params: { column: Column, filter: any, onChange: any, key?: string }) =>
                <select onChange={event => params.onChange(event.target.value)} style={{ width: "100%" }}
                    value={params.filter ? params.filter.value : "all"}>
                    <option value="all">Show All</option>
                    {model.languages.data.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
        },
        {
            Header: "Course",
            accessor: nameof<ICcData>(i => i.courseName),
        },
        {
            Header: "Year",
            accessor: nameof<ICcData>(i => i.courseYear),
        },
        {
            Header: "Problem",
            accessor: nameof<ICcData>(i => i.problem),
            filterMethod: (filter: any, row: ICcData) => {
                if (filter.value === "all") {
                    return true;
                }
                return getStatusOrDefault(row.result) === filter.value;
            },
            Filter: (params: { column: Column, filter: any, onChange: any, key?: string }) =>
                <select onChange={event => params.onChange(event.target.value)} style={{ width: "100%" }}
                    value={params.filter ? params.filter.value : "all"}>
                    <option value="all">Show All</option>
                    {courses
                        .flatMap(i => i.courseYears
                            .flatMap(j => j.problems
                                .map(k => {
                                    return { course: i.name, year: j.year, problem: k.id}
                                })))
                            .filter((i, j, k) => k.find(l => l.problem === i.problem) !== null)
                        .map(i => <option key={`${i.course}-${i.year}-${i.problem}`} value={i.problem}>{i.course}-{i.problem}</option>)
                    }
                </select>
        },
        {
            Header: "Review Request",
            accessor: nameof<ICcData>(i => i.reviewRequest),
            Cell: (any: any) => any.value ? "yes" : "",
            Filter: (params: { column: Column, filter: any, onChange: any, key?: string }) =>
                <select onChange={event => params.onChange(event.target.value)} style={{ width: "100%" }}
                    value={params.filter ? params.filter.value : "all"}>
                    <option value="all">Show All</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                </select>
        },
        {
            Header: "Comments",
            accessor: nameof<ICcData>(i => i.comments),
            Cell: (any: any) => (any.value && any.value.length) ? "yes" : "",
            Filter: (params: { column: Column, filter: any, onChange: any, key?: string }) =>
                <select onChange={event => params.onChange(event.target.value)} style={{ width: "100%" }}
                    value={params.filter ? params.filter.value : "all"}>
                    <option value="all">Show All</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                    <option value="1">exactly 1 comment</option>
                    <option value="2">exactly 2 comments</option>
                </select>
        },
        {
            Header: "Score",
            accessor: nameof<ICcData>(i => i.result),
            Cell: statusRenderer,
            filterable: false,
            maxWidth: 100,
            sortMethod: (a: ICcDataResult, b: ICcDataResult) => a.score - b.score,
        },
        {
            Header: "Points",
            accessor: nameof<ICcData>(i => i.points),
            filterable: true,
            maxWidth: 100,
        },
        {
            Header: "Status",
            accessor: nameof<ICcData>(i => i.result.status),
            Cell: (any: any) => {
                const status = ProcessStatusStatic.All.find(i => i.code === any.value);
                return !status ? "" : status.letter;
            },
            Filter: (params: { column: Column, filter: any, onChange: any, key?: string }) =>
                <select onChange={event => params.onChange(event.target.value)} style={{ width: "100%" }}
                    value={params.filter ? params.filter.value : "all"}>
                    <option value="all">Show All</option>
                    {statuses.map(i => <option key={i.value} value={i.value}>{i.key}</option>)}
                </select>
        },
        {
            Header: "Group",
            accessor: nameof<ICcData>(i => i.groupName),
        },
        {
            Header: () => <i className="fa fa-clock-o" />,
            Cell: (any: any) => <span>{Number(any.value).toFixed(2)}</span>,
            accessor: nameof<ICcData>(i => i.result.duration),
            filterable: false,
            maxWidth: 70
        },
    ];
    if (showFilters === false) {
        cols.forEach(i => {
            i.filterable = false;
            i.Filter = undefined;
        });
    }
    return cols;
}