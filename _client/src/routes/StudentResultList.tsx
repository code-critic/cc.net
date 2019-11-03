import React, { Children } from "react";
import { observer } from "mobx-react"
import { observable, action } from "mobx"
import { CellInfo, RowInfo, Filter, Column, ReactTableFunction, ReactTableDefaults } from "react-table";
import { nameof } from "ts-simple-nameof"
import "react-table/react-table.css";
import { nestGet } from "../utils/NestGetter";
import { ReactTableWithSelect } from "../utils/ReactTableWithSelect";
import { httpClient } from "../init";
import Moment from 'react-moment';
import moment from 'moment';
import { CondenseButton } from "../utils/CondenseButton";


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

class StudentResultListModel {
    @observable public dataIsLoading: boolean = true;
    @observable public apiIsLoading: boolean = true;
    public data: ICcData[] = [];
    public pages: number = 666;
    public languages: ILanguage[] = [];

    @action.bound
    public load(pageSize: number, page: number, sorted: ITableRequestSort[], filtered: ITableRequestFilter[]) {
        this.dataIsLoading = true;
        httpClient.fetch("student-result-list", { pageSize, page, sorted, filtered })
            .catch(e => console.error(e))
            .then((res: ITableResponse) => {
                this.data = res.data as ICcData[];
                this.pages = Math.ceil(res.count / pageSize);
                this.dataIsLoading = false;
            });
    }

    @action.bound
    private loadLanguages() {
        this.apiIsLoading = true;
        httpClient.fetch("languages")
            .then((data: ILanguage[]) => {
                this.languages = data;
                this.apiIsLoading = false;
            });
    }

    constructor() {
        this.loadLanguages();
    }
}

interface StudentResultListState {
    model?: StudentResultListModel;
    columnsToCopy: any;
}

function getStatusOrDefault(result: ICcDataResult) {
    if (result && result.status) {
        return result.status;
    } else {
        return "unknown";
    }
}

function getStatus(result: ICcDataResult) {
    return `status-${getStatusOrDefault(result)}`;
}

const statuses = {
    "answer-correct": "Answer Correct",
    "answer-correct-timeout": "Answer Correct Timeout",
    "answer-wrong": "Answer Wrong",
    "global-timeout": "Global Timeout",
    "compilation-failed": "Compilation Failed",
}

function statusRenderer(cellInfo: CellInfo, column: any) {
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

function AComponent(props: any) {
    const className = `rt-tr ${props.className}`;
    const objectId = props.objectId ? props.objectId : null;

    if (objectId) {
        const href = `/view-results/${objectId}`;
        return <a href={href} children={props.children} className={className} role="row" />
    } else {
        return <div children={props.children} className={className} role="row" />
    }

}

@observer
export class StudentResultList extends React.Component<any, StudentResultListState, any> {
    public model: StudentResultListModel = new StudentResultListModel();
    public columnsToCopy: any = {};

    @observable
    private density: string = "";

    private onFetchData(state: any, instance: any) {
        this.model.load(state.pageSize, state.page, state.sorted, state.filtered);
    }

    private extractData(key: string): string[] {
        if (key === "result") {
            return this.model.data.map(d => nestGet(d, "result.score"));
        }
        return this.model.data.map(d => nestGet(d, key));
    }

    private columns(): Column[] {
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
                filterMethod: (filter: Filter, row: ICcData, column: any) => {
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
                filterMethod: (filter: Filter, row: ICcData, column: any) => {
                    if (filter.value === "all") {
                        return true;
                    }
                    return getStatusOrDefault(row.result) === filter.value;
                },
                Filter: (params: { column: Column, filter: any, onChange: ReactTableFunction, key?: string }) =>
                    <select onChange={event => params.onChange(event.target.value)} style={{ width: "100%" }}
                        value={params.filter ? params.filter.value : "all"}>
                        <option value="all">Show All</option>
                        {this.model.languages.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
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
                Header: (cellInfo: CellInfo, column: any) => <i className="fa fa-clock-o" />,
                Cell: (cellInfo: CellInfo, column: any) => <span>{Number(cellInfo.value).toFixed(2)}</span>,
                accessor: nameof<ICcData>(i => i.result.duration),
                filterable: false,
                maxWidth: 70
            },
        ];
    }

    private changeDensity(value: string) {
        this.density = value;
    }

    render() {
        const { model } = this;
        const data: ICcData[] = model.data;
        const isLoading = model.dataIsLoading;

        if (model.apiIsLoading) {
            return <div>loading</div>
        }

        return (<div>
            <CondenseButton onChange={(value: string) => this.changeDensity(value)} />
            <ReactTableWithSelect
                extractData={(key: string) => this.extractData(key)}
                data={data}
                loading={isLoading}
                columns={this.columns()}
                className={`-highlight ${this.density}`}
                filterable manual
                onFetchData={(state: any, instance: any) => this.onFetchData(state, instance)}
                defaultPageSize={10}
                pages={model.pages}
                showPagination={true}
                // TrComponent={ReactTableDefaults.TrComponent}
                TrComponent={AComponent}
                defaultSorted={[
                    {
                        id: "attempt",
                        desc: true
                    }
                ]}
                getTrProps={(_finalState: any, rowInfo?: RowInfo) => {
                    if (!rowInfo) {
                        return {};
                    }
                    var data: ICcData = rowInfo.row;
                    return {
                        className: getStatus(data.result),
                        objectId: rowInfo.original ? (rowInfo.original as ICcData).objectId : null,
                        // onClick: (e) =>
                        //     this.props.history.push(
                        //         `/view-results/${(rowInfo.original as ICcData).objectId}`
                        //     )
                    };
                }}
            />
        </div>);
    }
}