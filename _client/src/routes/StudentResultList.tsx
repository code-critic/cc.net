import React from "react";
import { observer } from "mobx-react"
import { observable } from "mobx"
import { RowInfo, Column } from "react-table";
import { nestGet } from "../utils/NestGetter";
import { ReactTableWithSelect } from "../utils/ReactTableWithSelect";
import { CondenseButton } from "../utils/CondenseButton";
import { StudentResultDetail } from "./StudentResultDetail";
import { getColumns, getStatus } from "./StudentResultList.Columns";
import { StudentResultListModel } from "./StudentResultList.Model";
import { throttle } from 'throttle-debounce';

import "react-table/react-table.css";
import "../styles/detail.css";
import "../styles/list.css";
import { Modal } from "react-bootstrap";
import { ICcData } from "../models/DataModel";


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

    private debounceFetch: (state: any) => void = throttle(300, false, (state: any) => {
        this.model.load(state.pageSize, state.page, state.sorted, state.filtered);
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
        return getColumns(this.model);
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

    render() {
        const { model } = this;
        const data: ICcData[] = model.data;
        const isLoading = model.dataIsLoading;

        if (model.apiIsLoading) {
            return <div>loading</div>
        }

        return <div>
            <StudentResultDetail
                show={this.isModelVisible}
                objectId={model.detailObjectId}
                onCloseModal={(reload) => this.isModelVisible = false}
                />
            <CondenseButton onChange={(value: string) => this.changeDensity(value)} />
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
        </div>
    }
}