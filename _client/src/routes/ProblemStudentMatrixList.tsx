import React from "react";
import { observer } from "mobx-react"
import { observable, action } from "mobx"
import ReactTable, { Column, CellInfo } from "react-table";
import { ReactTableWithSelect } from "../utils/ReactTableWithSelect";
import { httpClient } from "../init";

import "react-table/react-table.css";
import "../styles/detail.css";
import "../styles/list.css";
import { nestGet } from "../utils/NestGetter";

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
    @observable public data: ICcDataResult[] = [];

    public columns: Column[] = [];


    constructor(courseId: string, courseYear: string) {
        this.setId(courseId, courseYear);
    }

    private emptyResult(): any {
        return {
            id: null,
            result: {
                score: -1,
                scores: [0, 0, 0]
            } as Partial<ICcDataResult>
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
        httpClient.fetch(`problem-student-matrix/${this.courseId}/${this.courseYear}/a`)
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
                        var match = res.filter(i => i.id.problem === problem && i.id.user === user);
                        var single: ICcDataResult = match.length ? match[0].result.result : this.emptyResult().result;
                        var rowData = (single || this.emptyResult().result);
                        row[problem] = rowData;
                    });
                    row.user = user;
                    data.push(row);
                });

                this.columns = [
                    {
                        Header: "User",
                        accessor: "user",
                        sortable: true,
                        Cell: (cellInfo: CellInfo) => cellInfo.value
                    }
                ];
                problems.forEach(problem => {
                    const col: Column = {
                        Header: problem,
                        accessor: problem,
                        Cell: (cellInfo: CellInfo) => {
                            const value: ICcDataResult = cellInfo.value;
                            return value.scores ? value.scores.join("-") : "---";
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
    public model: ProblemStudentMatrixListModel = new ProblemStudentMatrixListModel(
        this.props.match.params.id || null,
        this.props.match.params.year || null,
    );

    renderCourses() {
        if(this.model.apiIsLoading) {
            return "loading";
        }

        return this.model.courses.map(i => 
            i.courseYears.map(j =>
                <a key={i.name + j.year}
                    onClick={() => this.model.setId(i.name, j.year)}
                    href={`/problem-student-matrix/${i.name}/${j.year}`}>
                    {i.name} - {j.year}
                </a>
            )
        );
    }
    
    private extractData(key: string): string[] {
        if (key === "user") {
            return this.model.data.map(d => nestGet(d, key));
        } else {
            return this.model.data.map(d => {
                const score = Number(nestGet(d,`${key}.score`));
                const scores = nestGet(d,`${key}.scores`);
                return score == -1 ? "---" : String(Number(scores[0]) * 10);
            }
            );
        }
    }

    render() {
        if (!this.model.courseId) {
            return this.renderCourses();
        }

        if(this.model.dataIsLoading) {
            return "loading";
        }

        return <ReactTableWithSelect
            extractData={(key: string) => this.extractData(key)}
            columns={this.model.columns}
            sorted={[{id: "user", desc: false}]}
            data={this.model.data}
            multiSort={false}
            pageSize={-1}
            sortable
         />
    }
}
