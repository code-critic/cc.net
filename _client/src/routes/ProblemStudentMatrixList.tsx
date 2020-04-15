import { sum } from "d3";
import { action, observable } from "mobx";
import { observer } from "mobx-react";
import React from "react";
import { Link } from "react-router-dom";
import { CellInfo, Column } from "react-table";
import "react-table/react-table.css";
import { httpClient } from "../init";
import { ICcDataAgg, ICcDataResult, ICourse } from "../models/DataModel";
import "../styles/detail.css";
import "../styles/list.css";
import { getPoints } from "../utils/DataUtils";
import { nestGet } from "../utils/NestGetter";
import { ReactTableWithSelect } from "../utils/ReactTableWithSelect";
import { StudentResultDetail } from "./StudentResultDetail";
import { getStatus } from "./StudentResultList.Columns";


interface ProblemStudentMatrixListState {

}

function distinct(items: string[]) {
    const values = Array.from(new Set(items).values());
    return values.sort();
}

export class ProblemStudentMatrixListModel {
    @observable public dataIsLoading: boolean = true;
    @observable public apiIsLoading: boolean = true;
    @observable public courseId: string = "";
    @observable public courseYear: string = "";
    @observable public courses: ICourse[] = [];
    @observable public detailObjectId: string = "";

    public data: ICcDataResult[] = [];

    public columns: Column[] = [];


    constructor(courseId: string, courseYear: string) {
        this.setId(courseId, courseYear);
    }

    private emptyResult(): any {
        return {
            result: {
                id: null,
                result: {
                    score: -1,
                    scores: [0, 0, 0]
                } as Partial<ICcDataResult>
            }
        }
    }

    @action.bound
    setId(courseId: string, courseYear: string) {
        this.courseId = courseId;
        this.courseYear = courseYear;
        if (!this.courseId || !this.courseYear) {
            this.loadCourses();
        } else {
            this.loadCourse();
        }
    }

    @action.bound
    loadCourses() {
        this.apiIsLoading = true;
        httpClient.fetch("courses")
            .catch(e => console.error(e))
            .then((res: ICourse[]) => {
                this.courses = res;
                this.apiIsLoading = false;
            });
    }

    @action.bound
    loadCourse() {
        this.dataIsLoading = true;
        httpClient.fetch(`problem-student-matrix/${this.courseId}/${this.courseYear}`)
            .catch(e => console.error(e))
            .then((res: ICcDataAgg[]) => {
                let users = distinct([
                    "mikulas.papp",
                    ...res.map(i => i.id.user)
                ]);

                const problems = distinct(res.map(i => i.id.problem));
                let data: any[] = [];
                users.forEach(user => {
                    let row: any = {};
                    
                    problems.forEach(problem => {
                        let single: any = {};
                        try {
                            single = res
                                .filter(i => i.id.problem === problem && i.id.user === user)[0];
                        } catch (error) {
                        }
                        single = single || this.emptyResult();
                        const id = single.result.objectId;
                        row[problem] = single.result.result;
                        row[problem].id = id || null;
                        row[problem].points = single.result.points;
                    });
                    row.user = user;
                    data.push(row);
                });

                this.columns = [
                    {
                        Header: "User",
                        accessor: "user",
                        sortable: true,
                        width: 150,
                        getProps: () => {
                            return {
                                className: "text-align-left"
                            }
                        },
                        Cell: (cellInfo: CellInfo) => (cellInfo.value as string)
                            .split('.')
                            .map(i => i.charAt(0).toUpperCase() + i.slice(1))
                            .map((value, index) => index === 0 ? value : value.toUpperCase())
                            .join(' ')
                    }
                ];
                problems.forEach(problem => {
                    const col: Column = {
                        Header: problem,
                        accessor: problem,
                        Cell: (cellInfo: CellInfo) => {
                            const value: ICcDataResult | any = cellInfo.value;
                            const data = {result: value, points: value.points};
                            const points = getPoints(data as any, 0);
                            const sumScore = sum(value.scores);
                            if (points === 0 && sumScore === 0) {
                                return <div>---</div>
                            }
                            return <div className="cell cell-points">
                                    <div>{points}</div>
                                    {(value.scores && value.scores.length > 0) && (
                                        <small>({value.scores.join("-")})</small>
                                    )}
                                </div>
                        }
                    }
                    this.columns.push(col);
                });
                this.data = data;
                this.dataIsLoading = false;
            });
    }
}

@observer
export class ProblemStudentMatrixList extends React.Component<any, ProblemStudentMatrixListState, any> {
    @observable
    public isModelVisible: boolean = false;

    public model: ProblemStudentMatrixListModel = new ProblemStudentMatrixListModel(
        this.props.match.params.course || null,
        this.props.match.params.year || null,
    );

    renderCourses() {
        if (this.model.apiIsLoading) {
            return "loading";
        }

        return <ul>{this.model.courses.map(i =>
            i.courseYears.map(j =>
                <li key={i.name + j.year}>
                    <Link to={`/problem-student-matrix/${i.name}/${j.year}`}
                        onClick={() => this.model.setId(i.name, j.year)}>
                        {i.name} - {j.year}
                    </Link>
                </li>
            )
        )}</ul>;
    }

    private extractData(key: string): string[] {
        if (key === "user") {
            return this.model.data.map(d => nestGet(d, key));
        } else {
            return this.model.data.map(d => {
                const data = {result: d[key], points: d[key].points};
                return getPoints(data as any).toString();
            });
        }
    }

    private onDetailIdChanged(objectId: string = "") {
        if (this.model.detailObjectId === objectId || !objectId) {
            this.model.detailObjectId = "";
            this.isModelVisible = false;
        } else {
            this.model.detailObjectId = objectId;
            this.isModelVisible = true;
        }
    }

    private closeModal(reload: boolean) {
        this.isModelVisible = false;
        this.model.detailObjectId = "";
        if (reload) {
            this.model.loadCourse();
        }
    }
    
    render() {
        const { model } = this;
        
        if (!this.props.match.params.course) {
            return this.renderCourses();
        }

        if (model.dataIsLoading) {
            return "loading";
        }
        return "ok";

        return <div>
            <StudentResultDetail
                show={this.isModelVisible}
                objectId={model.detailObjectId}
                onCloseModal={(reload) => this.closeModal(reload)}
            />
            <ReactTableWithSelect
                extractData={(key: string) => this.extractData(key)}
                columns={this.model.columns}
                sorted={[{ id: "user", desc: false }]}
                data={this.model.data}
                multiSort={false}
                pageSize={-1}
                showPagination={false}
                getTdProps={(state, rowInfo, column) => {
                    const col = rowInfo.original[column.id];
                    const className = col.id === null ? `forbidden ${getStatus(col)}` : getStatus(col);
                    return {
                        className: column.id === "user" ? "" : className,
                        onClick: () => this.onDetailIdChanged(col.id)
                    }
                }}
                className="-stripped -highlight summary"
                sortable
            />
        </div>
    }
}
