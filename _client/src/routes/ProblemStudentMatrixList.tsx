import React from "react";
import { observer } from "mobx-react"
import { observable, action } from "mobx"
import { Column, CellInfo } from "react-table";
import { ReactTableWithSelect } from "../utils/ReactTableWithSelect";
import { httpClient } from "../init";

import "react-table/react-table.css";
import "../styles/detail.css";
import "../styles/list.css";
import { nestGet } from "../utils/NestGetter";
import { Modal } from "react-bootstrap";
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
                    });
                    row.user = user;
                    data.push(row);
                });

                this.columns = [
                    {
                        Header: "User",
                        accessor: "user",
                        sortable: true,
                        Cell: (cellInfo: CellInfo) => (cellInfo.value as string)
                            .split('.')
                            .map(i => i.charAt(0).toUpperCase() + i.slice(1))
                            .join(' ')
                    }
                ];
                problems.forEach(problem => {
                    const col: Column = {
                        Header: problem,
                        accessor: problem,
                        Cell: (cellInfo: CellInfo) => {
                            const value: ICcDataResult = cellInfo.value;
                            if (value.score === -1 || !value.scores || !value.scores.length) {
                                return <span>---</span>
                            }
                            return <span>{value.scores.join("-")}</span>
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
        if (this.model.apiIsLoading) {
            return "loading";
        }

        return <ul>{this.model.courses.map(i =>
            i.courseYears.map(j =>
                <li>
                    <a key={i.name + j.year}
                        onClick={() => this.model.setId(i.name, j.year)}
                        href={`/problem-student-matrix/${i.name}/${j.year}`}>
                        {i.name} - {j.year}
                    </a>
                </li>
            )
        )}</ul>;
    }

    private extractData(key: string): string[] {
        if (key === "user") {
            return this.model.data.map(d => nestGet(d, key));
        } else {
            return this.model.data.map(d => {
                const score = Number(nestGet(d, `${key}.score`));
                const scores = nestGet(d, `${key}.scores`);
                return score === -1 ? "---" : String(Number(scores[0]) * 10);
            }
            );
        }
    }

    private onDetailIdChanged(objectId: string = "") {
        if (this.model.detailObjectId === objectId || !objectId) {
            this.model.detailObjectId = "";
        } else {
            this.model.detailObjectId = objectId;
        }
    }

    render() {
        const { model } = this;
        if (!model.courseId) {
            return this.renderCourses();
        }

        if (model.dataIsLoading) {
            return "loading";
        }

        return <div>
            <Modal show={Boolean(model.detailObjectId)}
                size="lg" animation={false}
                onHide={() => this.onDetailIdChanged()}>
                <Modal.Header>
                    {model.detailObjectId}
                </Modal.Header>
                <Modal.Body>
                    {model.detailObjectId &&
                        <div className="student-result-detail">
                            <StudentResultDetail objectId={model.detailObjectId} />
                        </div>
                    }
                </Modal.Body>
            </Modal>
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
                        className: column.id == "user" ? "" : className,
                        onClick: () => this.onDetailIdChanged(col.id)
                    }
                }}
                className="-stripped -highlight"
                sortable
            />
        </div>
    }
}
