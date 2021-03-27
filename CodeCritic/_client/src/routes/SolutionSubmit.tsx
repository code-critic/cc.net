import { Breadcrumbs, Button, ButtonGroup, Container, Grid, Typography } from '@material-ui/core';
import Link from "@material-ui/core/Link";
import AddCircleOutlineOutlinedIcon from '@material-ui/icons/AddCircleOutlineOutlined';
import BubbleChartIcon from '@material-ui/icons/BubbleChart';
import CheckCircleOutlinedIcon from '@material-ui/icons/CheckCircleOutlined';
import ExtensionIcon from '@material-ui/icons/Extension';
import HomeIcon from '@material-ui/icons/Home';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import SchoolIcon from '@material-ui/icons/School';
import SendIcon from '@material-ui/icons/Send';
import GroupIcon from '@material-ui/icons/Group';
import React, { useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import { ICourseYearProblem, RouteComponentProps } from "../components/CourseProblemSelect";
import { CourseProblemSelector } from "../components/CourseProblemSelector";
import { AlertStatusMessage } from "../renderers/StatusMessageRenderer";
import { DropDownMenu } from "../components/DropDownMenu";
import { IFile } from "../components/FileChooser";
import { ShowAssets } from "../components/ShowAssets";
import { SimpleLoader } from "../components/SimpleLoader";
import { StudentResultItem } from "../components/StudentResults.Item";
import { StudentResultsDialog } from "../components/StudentResultsDialog";
import { appDispatcher, getUser, liveConnection } from "../init";
import { IAppUser, ICcData, ICcGroup, ICourse, ICourseProblem, ILanguage, ISingleCourse } from "../models/DataModel";
import "../third_party/mathjax";
import { ApiResource } from "../utils/ApiResource";
import { flattenCourse } from "../utils/DataUtils";
import { openCloseState } from "../utils/StateUtils";
import { hubException } from "../utils/utils";
import { SolutionSubmitForm } from "./SolutionSubmit.Form";
import Alert from '@material-ui/lab/Alert';
import { useUser } from '../hooks/useUser';
import { languages } from '../static/languages';






interface SolutionSubmitProps extends RouteComponentProps<ICourseYearProblem> {
}



interface LocalStorateCodeSnippet {
    code: string;
    date: Date,
    language: string;
}

const submitSolutionStudent = (user: IAppUser, activeCourse: ISingleCourse,
    activeProblem: ICourseProblem, language: ILanguage | undefined, files: IFile[]) => {

    // SubmitSolutionStudent(string userId, string courseName, string courseYear, string problemId, string langId, IList<SimpleFile> files)
    var message: any[] = [
        user.id,
        activeCourse.course,
        activeCourse.year,
        activeProblem.id,
        language?.id,
        files.map(f => {
            return {
                name: f.name,
                path: f.path,
                content: f.content
            }
        })
    ];

    liveConnection
        .invoke("SubmitSolutionStudent", ...message)
        .catch(hubException);
}

const submitSolutionGroup = (group: ICcGroup, activeCourse: ISingleCourse,
    activeProblem: ICourseProblem, language: ILanguage | undefined, files: IFile[]) => {

    // SubmitSolutionGroup(string groupId, string courseName, string courseYear, string problemId, string langId, IList < SimpleFile > files)
    var message: any[] = [
        group.objectId,
        activeCourse.course,
        activeCourse.year,
        activeProblem.id,
        language?.id,
        files.map(f => {
            return {
                name: f.name,
                path: f.path,
                content: f.content
            }
        })
    ];

    liveConnection
        .invoke("SubmitSolutionGroup", ...message)
        .catch(hubException);
}

type ioType = "input" | "output";
const generateInputOutput = (type: ioType, user: IAppUser, activeCourse: ISingleCourse, activeProblem: ICourseProblem) => {
    const method = `Generate${type[0].toUpperCase()}${type.substr(1)}`;
    // signature:
    //      GenerateInput(string userId, string courseName, string courseYear, string problemId)
    //      GenerateOutput(string userId, string courseName, string courseYear, string problemId)
    var message: any[] = [
        user.id,
        activeCourse.course,
        activeCourse.year,
        activeProblem.id,
    ]

    liveConnection
        .invoke(method, ...message)
        .catch(hubException);


}

interface RenderBreadcrumbsProps {
    activeCourse?: ISingleCourse;
    activeProblem?: ICourseProblem;
}

const RenderBreadcrumbs = (props: RenderBreadcrumbsProps) => {
    const { activeCourse, activeProblem } = props;

    const breadcrumbComponents = [{
        to: `/courses`,
        title: <><HomeIcon fontSize="small" /> Courses</>
    }];
    if (activeCourse) {
        breadcrumbComponents.push({
            to: `/courses/${activeCourse.course}/${activeCourse.year}`,
            title: <><SchoolIcon fontSize="small" /> {`${activeCourse.course}-${activeCourse.year}`}</>
        });
    }

    if (activeCourse && activeProblem) {
        breadcrumbComponents.push({
            to: `/courses/${activeCourse.course}/${activeCourse.year}/${activeProblem.id}`,
            title: <><ExtensionIcon fontSize="small" /> {`${activeProblem.name}`}</>
        });
    }

    const last = breadcrumbComponents.length - 1;
    return <Breadcrumbs aria-label="breadcrumb" separator={<NavigateNextIcon fontSize="small" />} className="breadcrumb">
        {breadcrumbComponents.map((i, j) => {
            if (j == last) {
                return <Typography key={j} color="textPrimary">{i.title}</Typography>
            }
            return <Link key={j} to={i.to} component={RouterLink} className="display-flex">{i.title}</Link>
        })}
    </Breadcrumbs>
}

export const SolutionSubmit = (props) => {

    const { history, match } = props;
    const [courses, setCourses] = React.useState<ICourse[]>([]);

    const [liveResult, setLiveResult] = React.useState<ICcData>();
    const [forcedResultId, setForcedResultId] = React.useState("");
    const [problem, setProblem] = React.useState<ICourseProblem>();
    const [userState, setUser] = React.useState(getUser());
    const [files, setFiles] = React.useState<IFile[]>([]);
    const [language, setLanguage] = React.useState<ILanguage>();
    const [params, setParams] = React.useState<any>();

    const [apiCourses, setApiCourses] = React.useState(new ApiResource<ICourse>("courses", false));
    const [resultsDialog, setResultsDialog] = React.useState(false);
    const [openResults, closeResults] = openCloseState(setResultsDialog);
    const { user, isRoot } = useUser();

    useEffect(() => {
        const MathJax = (window as any).MathJax;
        if (MathJax && MathJax.typeset) {
            MathJax.typeset();
        }
    });


    const { course: urlCourse, year: urlYear, problem: urlProblem } = match.params;
    const activeProblem = problem;
    const coursesFlatten = courses.flatMap(flattenCourse);
    const activeCourse = coursesFlatten.find(i => i.course == urlCourse && i.year == urlYear) as ISingleCourse;

    apiCourses.loadState(setCourses);


    history.listen((location, action) => {
        setProblem(undefined);
    });


    liveConnection.on("OnProcessStart", (item: ICcData) => {
        setLiveResult(item);
    });


    if (!user.role || !apiCourses.isLoaded) {
        return <SimpleLoader />
    }

    if (!problem || !activeProblem) {
        return <Container>
            <RenderBreadcrumbs activeCourse={activeCourse} activeProblem={activeProblem} />

            <CourseProblemSelector match={match} history={history} params={params}
                courses={courses} languages={languages}
                onProblemChange={(p) => setProblem(p)}
            />
        </Container>
    }

    const defaultLanguage = activeProblem.unittest
        ? languages.find(i => i.id === activeProblem.reference.lang)
        : languages[0];

    const hasAssets = !!problem.assets && problem.assets.length > 0;
    const { minSize, maxSize } = activeProblem?.collaboration ?? { };

    const meGroup = { objectId: "me", name: "me", users: [{ name: user.id}] } as any as ICcGroup;
    const validGroups = [...user.groups, meGroup]
        .map(i => {
            return {
                name: i.name,
                objectId: i.objectId,
                users: i.users,
                valid: i.users.length >= minSize && i.users.length <= maxSize
            }
        });

    return <Container>
        <RenderBreadcrumbs activeCourse={activeCourse} activeProblem={activeProblem} />
        <AlertStatusMessage problem={activeProblem} />

        <Grid container spacing={2} className="mt-2">
            {/* live result */}
            {liveResult && <Grid item xs={12} sm={12} lg={12}>
                <StudentResultItem
                    item={liveResult}
                    languages={languages}
                    onClick={() => {
                        setForcedResultId(liveResult.objectId);
                        openResults();
                    }}
                />
            </Grid>}

            {/* col 1 */}
            <Grid item xs={12} sm={12} lg={6}>
                {/* assets */}
                {hasAssets &&
                    <ShowAssets
                        urlPrefix={`/static-files/serve/${activeCourse.course}/${activeCourse.year}/${activeProblem.id}`}
                        assets={problem.assets} />
                }
                {/* description */}
                <div className="description" dangerouslySetInnerHTML={{ __html: problem.description }}>
                </div>
            </Grid>

            {/* col 2 */}
            <Grid item xs={12} sm={12} lg={6}>

                {/* group info */}
                {activeProblem.groupsAllowed &&
                    <>
                    <Alert severity="info" icon={<GroupIcon />} style={{marginBottom: 10}}>
                        <strong>For this problem, you can work in a group.</strong>&nbsp;
                        {(activeProblem.collaboration.minSize != activeProblem.collaboration.maxSize) &&
                            <p style={{ padding: 0, margin: 0 }}>
                                Group must have at least <strong>{activeProblem.collaboration.minSize}</strong>
                                &nbsp;and at most <strong>{activeProblem.collaboration.maxSize}</strong> students.
                            </p>
                        }
                        {(activeProblem.collaboration.minSize == activeProblem.collaboration.maxSize) &&
                            <p style={{ padding: 0, margin: 0 }}>
                                Group must have exactly <strong>{activeProblem.collaboration.maxSize}</strong> students
                            </p>
                        }
                    </Alert>
                    </>
                }

                {/* generate i/o */}
                {user.role === "root" && problem.unittest === false &&
                    <ButtonGroup size="large" fullWidth>
                        <Button startIcon={<AddCircleOutlineOutlinedIcon />} onClick={() => {
                            generateInputOutput("input", user, activeCourse, activeProblem)
                        }}>Generate Input</Button>
                        <Button endIcon={<CheckCircleOutlinedIcon />} onClick={() => {
                            generateInputOutput("output", user, activeCourse, activeProblem)
                        }}>Generate Output</Button>
                    </ButtonGroup>
                }

                {/* form */}
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <SolutionSubmitForm
                            onLanguageChange={setLanguage}
                            languages={languages}
                            onFileChange={setFiles}
                            activeProblem={problem}
                            defaultLanguage={defaultLanguage || languages[0]}
                        />
                    </Grid>
                </Grid>

                {/* submit/results */}
                <Grid item xs={12} container className="button bar my-2" justify="space-between">
                    <Button size="large" variant="outlined" color="secondary" endIcon={<BubbleChartIcon />}
                        onClick={openResults}>View Results
                    </Button>
                    {activeProblem.groupsAllowed &&
                        <DropDownMenu
                            buttonProps={{
                                color: "primary",
                                variant: "contained",
                                size: "large",
                                disabled: (!activeProblem.isActive && !isRoot) || validGroups.length == 0,
                                endIcon: <SendIcon />,
                            }}
                            title={validGroups.length == 0 ? "No group found" : "Submit As ..."}
                            options={validGroups}
                            getIsDisabled={i => !i.valid}
                            getLabel={i => i.objectId === "me"
                                ? <span><i>{i.name}</i> (only {(i.users.map(j => j.name).join(", "))})</span>
                                : <span>group <strong>{i.name}</strong> ({(i.users.map(j => j.name).join(", "))})</span>
                            }
                            onChange={i => {
                                if (i.objectId === "me") {
                                    submitSolutionStudent(user, activeCourse, activeProblem, language || defaultLanguage, files)
                                } else {
                                    submitSolutionGroup(i as any as ICcGroup, activeCourse, activeProblem, language || defaultLanguage, files)
                                }
                            }}
                        />
                    }
                    {!activeProblem.groupsAllowed &&
                        <Button size="large" variant="contained" color="primary" endIcon={<SendIcon />} disabled={!activeProblem.isActive && !isRoot}
                            onClick={() => submitSolutionStudent(user, activeCourse, activeProblem, language || defaultLanguage, files)}>Submit Solution
                        </Button>
                    }

                </Grid>
            </Grid>
        </Grid>
        {resultsDialog &&
            <StudentResultsDialog
                onClose={closeResults}
                languages={languages}
                activeProblem={activeProblem}
                activeCourse={activeCourse}
                forcedResultId={forcedResultId}
            />
        }
    </Container>
}
