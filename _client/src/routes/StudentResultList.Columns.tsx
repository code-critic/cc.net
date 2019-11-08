import React from "react";
import { CellInfo, Filter, Column, ReactTableFunction } from "react-table";
import { nameof } from "ts-simple-nameof"
import "react-table/react-table.css";
import Moment from 'react-moment';
import moment from 'moment';
import { StudentResultListModel } from "./StudentResultList.Model";


export function getStatusOrDefault(result: ICcDataResult) {
    if (result && result.status) {
        return result.status;
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

const statuses = {
    "answer-correct": "Answer Correct",
    "answer-correct-timeout": "Answer Correct Timeout",
    "answer-wrong": "Answer Wrong",
    "global-timeout": "Global Timeout",
    "compilation-failed": "Compilation Failed",
}

function statusRenderer(cellInfo: CellInfo) {
    var data = cellInfo.value as ICcDataResult;
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

export function getColumns(model: StudentResultListModel) {
    return [
        {
            Header: () => "#",
            accessor: nameof<ICcData>(i => i.attempt),
            maxWidth: 70,
            Filter: (params: { column: Column, filter: any, onChange: ReactTableFunction, key?: string }) =>
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
            Cell: (cellInfo: CellInfo) =>
                <Moment date={cellInfo.value * 1000} fromNow />,
            filterMethod: (filter: Filter, row: ICcData) => {
                if (filter.value === "all") {
                    return true;
                }
                return getStatusOrDefault(row.result) === filter.value;
            },
            Filter: (params: { column: Column, filter: any, onChange: ReactTableFunction, key?: string }) =>
                <select onChange={event => params.onChange(event.target.value)} style={{ width: "100%" }}
                    value={params.filter ? params.filter.value : "all"}>
                    <option value="all">Show All</option>
                    {dateRanges.map(l => <option key={l.value} value={l.value}>{l.name}</option>)}
                </select>
        },
        {
            Header: "User",
            accessor: nameof<ICcData>(i => i.user),
        },
        {
            Header: "Language",
            accessor: nameof<ICcData>(i => i.lang),
            filterMethod: (filter: Filter, row: ICcData) => {
                if (filter.value === "all") {
                    return true;
                }
                return getStatusOrDefault(row.result) === filter.value;
            },
            Filter: (params: { column: Column, filter: any, onChange: ReactTableFunction, key?: string }) =>
                <select onChange={event => params.onChange(event.target.value)} style={{ width: "100%" }}
                    value={params.filter ? params.filter.value : "all"}>
                    <option value="all">Show All</option>
                    {model.languages.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
        },
        {
            Header: "Problem",
            accessor: nameof<ICcData>(i => i.problem),
        },
        {
            Header: "Review Request",
            accessor: nameof<ICcData>(i => i.review_request),
            Cell: (cellInfo: CellInfo) => cellInfo.value ? "yes" : "",
            Filter: (params: { column: Column, filter: any, onChange: ReactTableFunction, key?: string }) =>
                <select onChange={event => params.onChange(event.target.value)} style={{ width: "100%" }}
                    value={params.filter ? params.filter.value : "all"}>
                    <option value="all">Show All</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
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
            Header: "Status",
            accessor: nameof<ICcData>(i => i.result.status),
            Filter: (params: { column: Column, filter: any, onChange: ReactTableFunction, key?: string }) =>
                <select onChange={event => params.onChange(event.target.value)} style={{ width: "100%" }}
                    value={params.filter ? params.filter.value : "all"}>
                    <option value="all">Show All</option>
                    {Object.entries(statuses).map(([v, k]) => <option key={v} value={v}>{k}</option>)}
                </select>
        },
        {
            Header: () => <i className="fa fa-clock-o" />,
            Cell: (cellInfo: CellInfo) => <span>{Number(cellInfo.value).toFixed(2)}</span>,
            accessor: nameof<ICcData>(i => i.result.duration),
            filterable: false,
            maxWidth: 70
        },
    ];
}