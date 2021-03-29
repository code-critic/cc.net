import NotificationsIcon from '@material-ui/icons/Notifications';
import React from 'react';
import {
    AppBar,
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    Grid,
    Slider,
    TextField,
    Typography
    } from '@material-ui/core';
import { appDispatcher, commentService, httpClient } from '../init';
import { Column } from 'react-table';
import { debounce } from 'throttle-debounce';
import { getColumns, getStatus } from './StudentResultList.Columns';
import { ICcData, IMarkSolutionItem } from '../models/DataModel';
import { nestGet } from '../utils/NestGetter';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { ReactTableWithSelect } from '../utils/ReactTableWithSelect';
import { StudentResultDetail } from '../components/StudentResultDetail';
import { StudentResultListModel } from './StudentResultList.Model';
import '../styles/detail.css';
import '../styles/list.css';
import { notifications } from '../utils/notifications';
// import 'react-table/react-table.css';



interface StudentResultListState {
    model?: StudentResultListModel;
    columnsToCopy: any;
}

const marks = [
    {
        value: (i: number) => i >= 0 && i < 50,
        label: 'Unacceptable',
    },
    {
        value: (i: number) => i >= 50 && i < 60,
        label: 'Barely acceptable',
    },
    {
        value: (i: number) => i >= 60 && i < 70,
        label: 'Satisfactory',
    },
    {
        value: (i: number) => i >= 70 && i < 80,
        label: 'Good',
    },
    {
        value: (i: number) => i >= 80 && i < 90,
        label: 'Excellent',
    },
    {
        value: (i: number) => i >= 90 && i < 100,
        label: 'Exceptional',
    },
    {
        value: (i: number) => i == 100,
        label: 'Perfect',
    },
];

const marks2 = [
    {
        value: 0,
        label: '0 %',
    },
    {
        value: 100,
        label: '100 %',
    }
];

interface GradeSystemProps {
    item: ICcData;
    onChange: () => void;
}

export const GradeSystem = (props: GradeSystemProps) => {
    const { item, onChange } = props;
    const [points, setPoints] = React.useState(item.points);
    const [comment, setComment] = React.useState(item.gradeComment || "");

    const mark = marks.find(i => i.value(points));
    const saveGrade = () => {
        httpClient.fetch(`save-grade`, {
            objectId: item.objectId,
            points: points,
            comment: comment
        } as IMarkSolutionItem)
            .then(i => {
                console.log(i);
                onChange();
                if (i.status === "ok") {
                    notifications.success(`Ok, saved`);
                } else {
                    notifications.error(`Error while saving`);
                }
            })
    }

    return <Box display="flex" flexDirection="row" alignItems="start">
        <Box display="flex" flexDirection="column" alignItems="center" flexGrow="1">
            <Slider marks={marks2} className="mb-0"
                onChange={(_, i) => setPoints(i as number)}
                value={points}
                step={1}
                min={0}
                max={100}
                valueLabelDisplay="auto" />
            <Typography component="small" className="pl-2">
                Grade: <strong>{mark?.label}</strong> ({points} %)
        </Typography>

            <TextField fullWidth value={comment}
                placeholder="Add comment"
                variant="outlined"
                rows={2}
                rowsMax={4}
                size="small"
                onChange={e => setComment(e.target.value)}
                multiline />
        </Box>
        <div style={{ width: 30 }}>&nbsp;</div>
        <Box display="flex" flexDirection="column" alignItems="center">
            <Button color="primary" size="large" variant="contained" onClick={saveGrade}>Save Grade</Button>
            <Typography component="small" className="tiny" style={{ maxWidth: 120 }}>
                <NotificationsIcon className="tiny" />Student will get a notification about the grade
            </Typography>
        </Box>
    </Box>
}

@observer
export class StudentResultList2 extends React.Component<any, StudentResultListState, any> {
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
                this.refresh();
            }
        });
    }

    private debounceFetch: (state: any) => void = debounce(300, false, (state: any) => {
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

    public refresh() {
        this.onFetchData(this.lastState);
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

    private closeDetail() {
        this.detailIsOpened = false;
    }

    changeCourse(e: any) {
        const dataset = e.target.selectedOptions[0].dataset;
        this.courseName = dataset.name;
        this.courseYear = dataset.year;
        this.course = e.target.value;
        this.onFetchData(this.lastState);
    }

    handleKeyPress(e: React.KeyboardEvent<HTMLDivElement>) {
        if (e.ctrlKey && this.detailIsOpened) {
            const index = this.model.data.findIndex(i => i.objectId == this.detailResult?.objectId);
            const total = this.model.data.length;
            if (index >= 0) {
                switch (e.keyCode) {
                    case 37: // left
                    case 40: // down
                        if (index == 0) {
                            notifications.info("That's all on this page");
                            this.closeDetail();
                        } else {
                            this.openDetail(this.model.data[index - 1]);
                            notifications.success(`Item ${index} of ${total}`);
                        }
                        break;
                    case 39: // right
                    case 49: // up
                        if (index == this.model.data.length-1) {
                            notifications.info("That's all on this page");
                            this.closeDetail();
                        } else {
                            this.openDetail(this.model.data[index + 1]);
                            notifications.success(`Item ${index + 2} of ${total}`)
                        }
                        break;
                    default:
                        break;
                }
            }
        }
    }

    render() {
        const { model, detailIsOpened, detailResult } = this;
        const data: ICcData[] = model.data;
        const isLoading = model.dataIsLoading;

        if (model.apiIsLoading) {
            return <div>loading</div>
        }

        return <div>
            {detailResult && detailIsOpened &&
                <Dialog open={detailIsOpened} fullWidth maxWidth="lg"
                    className={commentService.items.length > 0 ? "unsaved" : ""}
                    onClose={() => this.detailIsOpened = !detailIsOpened}
                    onKeyDown={e => this.handleKeyPress(e)}
                >
                    <DialogTitle>
                        <Box padding={2}>
                            <Grid container justify="space-between">
                                <Grid item>
                                    {detailResult.user}
                                </Grid>
                                {commentService.items.length > 0 && <Grid item>
                                    <Button onClick={() => commentService.postComments()}
                                        variant="contained" color="secondary">
                                        Add {commentService.items.length} comment{commentService.items.length > 1 ? "s" : ""}
                                    </Button>
                                </Grid>}
                                <Grid item style={{ minWidth: 500 }}>
                                    <GradeSystem item={detailResult} onChange={() => this.refresh()} />
                                </Grid>
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

            {/* <div style={{ display: "flex" }}>
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
            </div> */}

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
                                id: "id.timestamp",
                                desc: true
                            }
                        ]}
                        getTrProps={(_finalState: any, rowInfo?: any) => {
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
        </div>
    }
}