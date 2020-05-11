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
import { getColumns, getStatus } from "./StudentResultList.Columns";
import { StudentResultListModel } from "./StudentResultList.Model";
import { StudentResultDetail } from "../components/StudentResultDetail";
import { Dialog, DialogTitle, DialogContent, Button, Box, AppBar, Grid } from "@material-ui/core";
import { appDispatcher, commentService } from "../init";



interface StudentResultListState {
    model?: StudentResultListModel;
    columnsToCopy: any;
}

@observer
export class StudentResultList extends React.Component<any, StudentResultListState, any> {
    public model: StudentResultListModel = new StudentResultListModel();
    public columnsToCopy: any = {};

    @observable
    public isModelVisible: boolean = false;

    @observable
    private density: string = "";

    @observable
    private courseName: string = "";

    @observable
    private courseYear: string = "";

    @observable
    private course: string = "";

    private lastState: any;

    @observable
    public detailIsOpened: boolean = false;

    @observable
    public detailResult?: ICcData;

    @observable
    public forceUpdateField = 0;

    constructor(props: any) {
        super(props);

        appDispatcher.register((payload: any) => {
            if (payload.actionType == "commentServiceChanged") {
                this.forceUpdateField++;
            }
        });
    }

    private debounceFetch: (state: any) => void = throttle(300, false, (state: any) => {
        const { courseName, courseYear, model } = this;
        this.lastState = state;

        if (courseName !== "") {
            model.load(state.pageSize, state.page, state.sorted, [
                ...state.filtered,
                { id: "courseName", value: courseName },
                { id: "courseYear", value: courseYear },
            ]);
        } else {
            model.load(state.pageSize, state.page, state.sorted, state.filtered);
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
                : this.model.courses.data.filter(i => !!~this.courseName.indexOf(i.name))
        );
    }

    private changeDensity(value: string) {
        this.density = value;
    }

    private openDetail(result: ICcData) {
        this.detailIsOpened = true;
        this.detailResult = result;
    }

    changeCourse(e: any) {
        const dataset = e.target.selectedOptions[0].dataset;
        this.courseName = dataset.name;
        this.courseYear = dataset.year;
        this.course = e.target.value;
        this.onFetchData(this.lastState);
    }

    render() {
        const { model, detailIsOpened, detailResult } = this;
        const data: ICcData[] = model.data;
        const isLoading = model.dataIsLoading;

        if (model.apiIsLoading) {
            return <div>loading</div>
        }

        console.log(commentService.items);


        return <div>
            {detailResult && detailIsOpened &&
                <Dialog open={detailIsOpened} fullWidth maxWidth="md" className={commentService.items.length > 0 ? "unsaved" : ""}
                    onClose={() => this.detailIsOpened = !detailIsOpened}>
                    <DialogTitle>
                        <Box padding={2}>
                            <Grid container justify="space-between">
                                <Grid item>
                                    {detailResult.user}
                                </Grid>
                                {commentService.items.length > 0 && <Grid item>
                                    <Button variant="contained" color="secondary">
                                        Add {commentService.items.length} comment{commentService.items.length > 1 ? "s" : ""}
                                    </Button>
                                </Grid>}
                            </Grid>
                        </Box>
                    </DialogTitle>
                    <DialogContent>
                        <StudentResultDetail
                            objectId={detailResult.objectId}
                        />
                    </DialogContent>
                </Dialog>
            }

            <div style={{ display: "flex" }}>
                <Form.Group>
                    <Form.Label>Select course</Form.Label>
                    <Form.Control as="select" onChange={(e) => this.changeCourse(e)} value={this.course}>
                        <option value="" data-name="" data-year="">Show all</option>
                        {model.courses.data.flatMap(i => i.courseYears.map(j => { return { name: i.name, year: j.year } }
                        )).map(i =>
                            <option data-name={i.name} data-year={i.year}
                                value={`${i.name}-${i.year}`} key={`${i.name}-${i.year}`}>
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
                                    this.openDetail((data as any)._original);
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