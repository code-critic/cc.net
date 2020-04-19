import { observable } from "mobx";
import { observer } from "mobx-react";
import React from "react";
import { Form } from "react-bootstrap";
import { Column, RowInfo } from "react-table";
import "react-table/react-table.css";
import { throttle } from 'throttle-debounce';
import { ICcData } from "../models/DataModel";
import "../styles/detail.css";
import "../styles/list.css";
import { CondenseButton } from "../utils/CondenseButton";
import { nestGet } from "../utils/NestGetter";
import { ReactTableWithSelect } from "../utils/ReactTableWithSelect";
import { StudentResultDetail2 } from "./StudentResultDetail2";
import { getColumns, getStatus } from "./StudentResultList.Columns";
import { StudentResultListModel } from "./StudentResultList.Model";



interface StudentResultListState {
    model?: StudentResultListModel;
    columnsToCopy: any;
}

// function AComponentWrapper(callback: (objectId: string) => void) {

//     function AComponent(props: any) {
//         const className = `rt-tr ${props.className}`;
//         const objectId = props.objectId ? props.objectId : null;

//         if (objectId) {
//             // const href = `/view-results/${objectId}`;
//             return <a onClick={() => callback(objectId)} children={props.children} className={className} role="row" />
//         } else {
//             return <div children={props.children} className={className} role="row" />
//         }
//     }
//     return AComponent;
// }


@observer
export class StudentResultList extends React.Component<any, StudentResultListState, any> {
    public model: StudentResultListModel = new StudentResultListModel();
    public columnsToCopy: any = {};

    @observable
    public isModelVisible: boolean = false;

    @observable
    private density: string = "";

    @observable
    private course: string = "";

    private lastState: any;

    private debounceFetch: (state: any) => void = throttle(300, false, (state: any) => {
        this.lastState = state;
        
        if(this.course !== "") {
            this.model.load(state.pageSize, state.page, state.sorted, [
                ...state.filtered,
                {id: "course", value: this.course}
            ]);
        }else{
            this.model.load(state.pageSize, state.page, state.sorted, state.filtered);
        }
    })

    private onFetchData(state: any) {
        this.debounceFetch(state);
    }

    private extractData(key: string): string[] {
        if (key === "result") {
            return this.model.data.map(d => nestGet(d, "result.score"));
        }
        return this.model.data.map(d => nestGet(d, key));
    }

    public columns(): Column[] {
        return getColumns(
            this.model,
            this.course === ""
                ? this.model.courses.data
                : this.model.courses.data.filter(i => !!~this.course.indexOf(i.name))
            );
    }

    private changeDensity(value: string) {
        this.density = value;
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

    changeCourse (e: any) {
        this.course = e.target.value;
        this.onFetchData(this.lastState);
    }

    render() {
        const { model } = this;
        const data: ICcData[] = model.data;
        const isLoading = model.dataIsLoading;

        if (model.apiIsLoading) {
            return <div>loading</div>
        }

        return <div>
            <StudentResultDetail2
                show={this.isModelVisible}
                objectId={model.detailObjectId}
                onClose={(reload) => this.isModelVisible = false}
            />

            <div style={{ display: "flex" }}>
                <Form.Group>
                    <Form.Label>Select course</Form.Label>
                    <Form.Control as="select" onChange={(e) => this.changeCourse(e)} value={this.course}>
                        <option value="">Show all</option>
                        {model.courses.data.flatMap(i => i.courseYears.map(j => { return { name: i.name, year: j.year } }
                        )).map(i =>
                            <option value={`${i.name}-${i.year}`} key={`${i.name}-${i.year}`}>
                                {i.name}-{i.year}
                            </option>
                        )}
                    </Form.Control>
                </Form.Group>
            </div>

            <div className="student-result-list-wrapper">
                <div className="student-result-list">
                    <ReactTableWithSelect
                        extractData={(key: string) => this.extractData(key)}
                        data={data}
                        loading={isLoading}
                        columns={this.columns()}
                        className={`-highlight ${this.density}`}
                        filterable manual
                        onFetchData={(state: any, instance: any) => this.onFetchData(state)}
                        defaultPageSize={10}
                        pages={model.pages}
                        showPagination={true}
                        // // TrComponent={ReactTableDefaults.TrComponent}
                        // TrComponent={AComponentWrapper((e) => this.onDetailIdChanged(e))}
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
                                onClick: (e) => {
                                    this.onDetailIdChanged((data as any)._original.objectId);
                                }
                            };
                        }}
                    />
                </div>
            </div>
            <CondenseButton onChange={(value: string) => this.changeDensity(value)} />
        </div>
    }
}