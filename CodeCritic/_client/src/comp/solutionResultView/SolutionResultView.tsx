import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';

import { Button, Container, Typography } from '@material-ui/core';
import AdjustIcon from '@material-ui/icons/Adjust';
import AssessmentIcon from '@material-ui/icons/Assessment';
import CancelIcon from '@material-ui/icons/Cancel';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import DescriptionIcon from '@material-ui/icons/Description';
import GradeIcon from '@material-ui/icons/Grade';
import PersonIcon from '@material-ui/icons/Person';
import SecurityIcon from '@material-ui/icons/Security';
import SendIcon from '@material-ui/icons/Send';
import TimelineIcon from '@material-ui/icons/Timeline';
import TimerIcon from '@material-ui/icons/Timer';
import TodayIcon from '@material-ui/icons/Today';

import { CodeCritic } from '../../api';
import { IApiError, ICcData, ICourseProblem, IMarkSolutionItem, ISimpleFile } from '../../cc-api';
import { SimpleLoader } from '../../components/SimpleLoader';
import { useComments } from '../../hooks/useComments';
import { useRefresh } from '../../hooks/useRefresh';
import { useUser } from '../../hooks/useUser';
import { ProblemStatus } from '../../models/Enums';
import { AbsMoment } from '../../renderers/AbsMoment';
import { CourseYearProblemHeader } from '../../renderers/CourseYearProblemHeader';
import { IconClass } from '../../renderers/IconClass';
import { LightTooltip } from '../../renderers/LightTooltip';
import { renderError } from '../../renderers/renderErrors';
import { TimelineRenderer } from '../../renderers/TimelineRenderer';
import { SourceCodeReview } from '../../text/SourceCodeReview';
import { nop } from '../../utils/nop';
import { notifications } from '../../utils/notifications';
import { getStatus } from '../../utils/StatusUtils';
import { humanizeName } from '../../utils/utils';
import { PreviousResults } from '../previousResults/PreviousResults';
import { SolutionResultViewGradeDialog } from './SolutionResultView.GradeDialog';
import { SolutionResultViewTreeViewRoot } from './SolutionResultView.TreeView';

interface IParamsObjectId {
    objectId?: string;
}

const extractSingleSimpleFile = (result: ICcData) => {
    if (result.solutions?.length >= 0) {
        const f = result.solutions.filter(i => i.isMain)[0];

        if (f == undefined) {
            return undefined;
        }
        
        return {
            filename: f.filename ?? "empty",
            content: f.content ?? "",
            isDir: false,
            files: [],
            relPath: `/${f.filename ?? "empty"}`,
            rawPath: null,
        } as ISimpleFile;
    }
    return undefined;
}

const IncongnitoIcon = (props) => {
    return <svg className="MuiSvgIcon-root MuiSvgIcon-fontSizeSmall" focusable="false" viewBox="0 0 120 120" aria-hidden="true">
            <path d="M60 0c33.137 0 60 26.863 60 60s-26.863 60-60 60S0 93.137 0 60 26.863 0 60 0zm17.5 64.837c-6.456 0-11.822 4.502-13.222 10.516-3.267-1.397-6.3-1.009-8.556-.039C54.283 69.3 48.917 64.837 42.5 64.837c-7.506 0-13.611 6.092-13.611 13.582C28.889 85.908 34.994 92 42.5 92c7.156 0 12.95-5.51 13.494-12.495 1.167-.815 4.24-2.328 8.012.078C64.628 86.529 70.383 92 77.5 92c7.506 0 13.611-6.092 13.611-13.581 0-7.49-6.105-13.582-13.611-13.582zm-35 3.88c5.367 0 9.722 4.347 9.722 9.702 0 5.355-4.355 9.7-9.722 9.7-5.367 0-9.722-4.345-9.722-9.7 0-5.355 4.355-9.701 9.722-9.701zm35 0c5.367 0 9.722 4.347 9.722 9.702 0 5.355-4.355 9.7-9.722 9.7-5.367 0-9.722-4.345-9.722-9.7 0-5.355 4.355-9.701 9.722-9.701zM95 57H25v4h70v-4zM72.874 29.34c-.8-1.82-2.866-2.78-4.785-2.143L60 29.914l-8.128-2.717-.192-.058c-1.928-.533-3.954.51-4.669 2.387L38.144 53h43.712L72.95 29.526z" />
        </svg>
}

interface SolutionResultViewProps extends IParamsObjectId {
    onChange?: () => void;
    onClose?: () => void;
    nextPage?: () => void;
    prevPage?: () => void;
}

export const SolutionResultView = (props: SolutionResultViewProps) => {
    const { onChange = nop, onClose = nop, nextPage = nop, prevPage = nop } = props;
    const params = useParams<IParamsObjectId>();
    
    const { user, isRoot } = useUser();
    const [ result, setResult ] = useState<ICcData>();
    const [ selectedResultId, setSelectedResultId ] = useState<string>();

    const { counter, refresh } = useRefresh();
    const [ error, setError ] = useState<IApiError>();
    const [ selectedFile, setSelectedFile ] = useState<ISimpleFile>();
    const [ gradeDialog, setGradeDialog ] = useState(false);
    const { comments, postCommentsAsync } = useComments();
    const [ problemRef, setProblemRef ] = useState<ICourseProblem>();

    const objectId = selectedResultId ?? props.objectId ?? params.objectId;
    

    useEffect(() => {
        (async () => {
            if (objectId) {
                try {
                    const response = await CodeCritic.api.resultGetDetail(objectId);
                    const result = response.data.data;

                    setResult(result);
                    setSelectedFile(extractSingleSimpleFile(result));
                    setError(undefined);
                    setSelectedResultId(result.objectId);
                } catch (error) {
                    setError({
                        name: "Not found",
                        errors: [ "Solution was not found" ]
                    });
                }
            }
        })();
    }, [ user.id, counter, objectId ]);

    useEffect(() => {
        (async () => {
            if (isRoot && result) {
                const axiosResponse = await CodeCritic.api.courseListList();
                const courses = axiosResponse.data.data;
                const problemRef = courses
                    .find(i => i.course === result.courseName && i.year === result.courseYear)?.problems
                    .find(i => i.id === result.problem);
                setProblemRef(problemRef);
            }
        })()
    }, [ result?.objectId ]);

    useEffect(() => {
        setSelectedResultId(undefined);
    }, [ params?.objectId, props.objectId ]);
    
    const handleFileChange = async (file: ISimpleFile) => {
        if (file.content === null) {
            file.content = <SimpleLoader/>
            setSelectedFile(file);

            const response = await CodeCritic.api.fileGetDetail(objectId, file.relPath);
            console.log(response);
            const { content } = response.data as any;
            file.content = content ?? "";
            setSelectedFile({ ...file });
        } else {
            setSelectedFile(file);
        }
    }

    if (error) {
        return renderError(error, 0, false);
    }

    if (!result) {
        return <SimpleLoader/>
    }

    const { courseName, courseYear, problem, reviewRequest, points, result: mainResult } = result;
    const { userOrGroupUsers, groupName, user: username } = result;
    const { status, message, messages } = mainResult;
    const mainStatus = getStatus(status);
    const Icon = IconClass(result);
    const canEditResult = (user.id == result.user && result.points <= 0) || isRoot;
    const statusName = `status-${mainStatus.name}`;
    const extraCls = onClose == undefined
        ? "solution-result-view full-page"
        : "solution-result-view dialog-page";

    const requestCR = async () => {
        await CodeCritic.api.reviewrequestDetail(result.objectId);
        refresh();
        onChange();
    }

    const cancelCR = async () => {
        await CodeCritic.api.reviewrequestDelete(result.objectId);
        refresh();
        onChange();
    }

    const postCommentsAndRefresh = async () => {
        await postCommentsAsync();
        refresh();
        onChange();
    }

    const showGradeDialog = () => {
        setGradeDialog(true);
    }

    const hideGradeDialog = async () => {
        setGradeDialog(false);
        refresh();
        onChange();
    }

    const saveGrade = async (points: number) => {
        const grade:IMarkSolutionItem = { comment: "", points, objectId }
        try {
            const data = await CodeCritic.api.saveGradeCreate(grade);
            notifications.success(`Saved! ${data.data.count} notification(s) sent`);
            refresh();
            onChange();
            return true;
        } catch (error) {
            notifications.error(`Error while saving: ${error}`);
            return false;
        }
    }

    // const saveGradeAndNext = async (points: number) => {
    //     const success = await saveGrade(points);
    //     if (success) {
    //         nextPage();
    //     }
    // }

    const prettifyConsoleMessages = (messages: string[]) => {
        const prettifiers = [
            { regex: new RegExp(/\{.*Error using main \(line \d+\)\n(.*)\n\}.*/, "gm"), replacement: "$1" },
            { regex: new RegExp(/\{.*Error using check\/finalize \(line \d+\)\n(Some of the tests failed!)\n(.*)\n(.*)\n(.*)\n\}.*/, "gm"),
                replacement: "Some of the tests failed! See output for more details." },
        ]
        let text = (messages ?? []).join("\n")
        prettifiers.forEach(i => {
            text = text.replaceAll(i.regex, i.replacement);
        });

        return text.trimEnd().split("\n");
    }

    return (<>
        <Container maxWidth={"lg"} className={extraCls}>
            <div className="solution-result-view">
                <div className={`solution-result-view-grid ${statusName}`}>
                    <div className="sol-inf sol-item">
                        <Typography variant="h4" className="hide-links pb1">
                            <CourseYearProblemHeader course={courseName} year={courseYear} problem={problem}/>
                            <ChevronRightIcon color="disabled"/>
                            <Typography variant="inherit" component={RouterLink}
                                to={`/r/${objectId}`}>
                                    #{result.attempt}
                            </Typography>
                            {isRoot && <>
                                <ChevronRightIcon color="disabled"/>
                                <Typography variant="inherit" component={RouterLink}
                                    to={`/grade-results/${courseName}/${courseYear}/${problem}`}>
                                        <small>view grades <AssessmentIcon /></small>
                            </Typography>
                            </>}
                        </Typography>

                        <div className="key-value-grid">
                            <div className="key"><PersonIcon/>Author(s)</div>
                            <div className="value">
                                {groupName && <>{groupName} ({userOrGroupUsers.map(humanizeName).join(", ")})</>}
                                {!groupName && <>{humanizeName(username)} {isRoot && <>&nbsp;<code>({username})</code></>}</>}
                            </div>
                        </div>
                        
                        <div className="key-value-grid">
                            <div className="key"><TodayIcon/>Submitted</div>
                            <div className="value">
                                <AbsMoment date={result.id.creationTime} />
                            </div>
                        </div>

                        <div className="key-value-grid">
                            <div className="key"><TimerIcon/>Duration</div>
                            <div className="value">
                                {mainResult?.duration?.toFixed(3) ?? "??"} sec
                            </div>
                        </div>

                        <div className="key-value-grid">
                            <div className="key"><GradeIcon/>Review Request</div>
                            <div className="value">
                                {reviewRequest != null && <>
                                    Requested &nbsp;<AbsMoment date={reviewRequest}/>

                                    {canEditResult &&
                                    <Button className="small" color="secondary" size="small" variant="contained" onClick={cancelCR}>
                                        Cancel Review Request <CancelIcon />
                                    </Button>}
                                    {!canEditResult &&
                                    <Button className="small" color="secondary" size="small" variant="contained" disabled>
                                        No longer possible to cancel
                                    </Button>}
                                </>}
                                {reviewRequest == null && <>
                                    Not requested
                                    {canEditResult &&
                                    <Button className="small" color="primary" size="small" variant="contained" onClick={requestCR}>
                                        Request now <SendIcon/>
                                    </Button>}
                                    {!canEditResult &&
                                    <Button className="small" color="secondary" size="small" variant="contained" disabled>
                                        No longer possible to request
                                    </Button>}
                                </>}
                            </div>
                        </div>

                        {reviewRequest != null && result.gradeComment?.length > 0 &&
                            <div className="key-value-grid">
                                <div className="key"><DescriptionIcon/>Comment from Teacher</div>
                                <div className="value">
                                    {result.gradeComment}
                                </div>
                            </div>}

                        {isRoot != null && problemRef != null &&
                            <div className="key-value-grid">
                                <div className="key"><TimelineIcon/>Problem timeline</div>
                                <div className="value problem-timeline">
                                    <span className={`connector ${problemRef.statusCode === ProblemStatus.BeforeStart ? "active" : ""}`} />

                                    <LightTooltip title={<>Actived: <AbsMoment noTooltip date={problemRef.since} /></>}>
                                        <AdjustIcon className="dot" />
                                    </LightTooltip>

                                    <span className={`connector ${problemRef.statusCode === ProblemStatus.Active ? "active" : ""}`} />

                                    <LightTooltip title={<>Soft deadline: <AbsMoment noTooltip date={problemRef.avail} /></>}>
                                        <AdjustIcon className="dot" />
                                    </LightTooltip>

                                    <span className={`connector ${problemRef.statusCode === ProblemStatus.ActiveLate ? "active" : ""}`} />

                                    <LightTooltip title={<>Hard deadline: <AbsMoment noTooltip date={problemRef.deadline} /></>}>
                                        <AdjustIcon className="dot" />
                                    </LightTooltip>

                                    <span className={`connector ${problemRef.statusCode === ProblemStatus.AfterDeadline ? "active" : ""}`} />
                                </div>
                            </div>}

                            {isRoot && selectedResultId != null &&
                                <div className="key-value-grid">
                                    <div className="key"><SecurityIcon/>Previous results</div>
                                    <div className="value">
                                        <PreviousResults
                                            onChange={setSelectedResultId}
                                            result={result}
                                            selectedResultId={selectedResultId}
                                            nextPage={nextPage}
                                            prevPage={prevPage}
                                            />
                                    </div>
                                </div>}
                            
                    </div>
                    <div className="sol-sts sol-item">
                        {reviewRequest && <div className="grade-grid">
                            <Button className="grade-btn" disabled={!isRoot} onClick={showGradeDialog}>
                                {points > 0 ? points : "??"}<small className="text-muted">/100</small>
                            </Button>
                            <div className="grade-grades">
                                {[50, 75, 90, 100].map((i, j) =>
                                    <Button key={j} onClick={() => saveGrade(i)}>{i}</Button>
                                )}
                            </div>
                        </div>}
                    </div>
                    <div className="sol-res sol-item">
                        <Typography variant="h6" className="sol-status">
                            <Icon/>&nbsp;
                            <>{message ?? mainStatus.description} ({mainStatus.name})</>
                        </Typography>
                        <div className="sol-status-info pretty-scrollbar">
                            {messages?.length > 0 && <ol className="console">
                                {prettifyConsoleMessages(messages).map((i, j) => <li key={j}>
                                    <pre>{i}</pre>
                                </li>)}
                            </ol>}
                        </div>
                    </div>
                    <div className="sol-sub sol-item">
                        {result.results?.length > 1 && <div className="subresults-wrapper">
                            <Typography variant="h6" className="sol-status">
                                <Icon/>&nbsp;Subresults
                            </Typography>
                            <div className="sol-status-info">
                                <TimelineRenderer showExtra={isRoot} result={result}/>
                            </div>
                        </div>}
                    </div>
                    <div className="sol-exp">
                        <SolutionResultViewTreeViewRoot onChange={handleFileChange} result={result}/>
                    </div>
                    <div className="sol-src">
                        {comments.length > 0 && <Button color="secondary" style={{float: "right"}} onClick={postCommentsAndRefresh}>
                            Send {comments.length} comments
                        </Button>}
                        {selectedFile && <>
                            <Typography variant="h6" className="sol-status">
                                <DescriptionIcon/>&nbsp;{selectedFile.filename}
                            </Typography>
                            <SourceCodeReview
                                objectId={objectId}
                                relPath={selectedFile.relPath}
                                code={selectedFile.content}
                                comments={result.comments}
                            />
                        </>}
                    </div>
                    <div className="sol-btn">
                        <span className="filler"/>
                        {comments.length > 0 && <Button color="secondary" onClick={postCommentsAndRefresh}>
                            Send {comments.length} comments
                        </Button>}
                        {onClose && <Button color="primary" onClick={onClose}>Close</Button>}
                    </div>
                </div>
            </div>
        </Container>
        {gradeDialog && <SolutionResultViewGradeDialog
            onClose={hideGradeDialog}
            objectId={objectId}/>}
    </>)
}
