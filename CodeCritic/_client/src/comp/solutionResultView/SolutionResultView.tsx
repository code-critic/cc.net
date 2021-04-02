import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';

import { Button, Container, Typography } from '@material-ui/core';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import DescriptionIcon from '@material-ui/icons/Description';

import { API } from '../../api';
import { SimpleLoader } from '../../components/SimpleLoader';
import { useComments } from '../../hooks/useComments';
import { useRefresh } from '../../hooks/useRefresh';
import { useUser } from '../../hooks/useUser';
import { IApiResponse } from '../../models/CustomModel';
import { IApiError, ICcData, ISimpleFile } from '../../models/DataModel';
import { AbsMoment } from '../../renderers/AbsMoment';
import { CourseYearProblemHeader } from '../../renderers/CourseYearProblemHeader';
import { IconClass } from '../../renderers/IconClass';
import { renderError } from '../../renderers/renderErrors';
import { TimelineRenderer } from '../../renderers/TimelineRenderer';
import { SourceCodeReview } from '../../text/SourceCodeReview';
import { getStatus } from '../../utils/StatusUtils';
import { humanizeName } from '../../utils/utils';
import { SolutionResultViewTreeViewRoot } from './SolutionResultView.TreeView';
import { SolutionResultViewGradeDialog } from './SolutionResultView.GradeDialog';
import { notifications } from '../../utils/notifications';
import { nop } from '../../utils/nop';

interface IParamsObjectId {
    objectId?: string;
}
const extractSingleSimpleFile = (result: ICcData) => {
    const f = result.solutions[0];
    if (!f) {
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

interface SolutionResultViewProps extends IParamsObjectId {
    onChange?: () => void;
    onClose?: () => void;
}

export const SolutionResultView = (props: SolutionResultViewProps) => {
    const { onChange = nop, onClose } = props;
    const params = useParams<IParamsObjectId>();
    const objectId = props.objectId ?? params.objectId;
    const { user, isRoot } = useUser();
    const [result, setResult] = useState<ICcData>();
    const { counter, refresh } = useRefresh();
    const [error, setError] = useState<IApiError>();
    const [selectedFile, setSelectedFile] = useState<ISimpleFile>();
    const [gradeDialog, setGradeDialog] = useState(false);
    const { comments, postCommentsAsync } = useComments();

    useEffect(() => {
        (async () => {
            if (objectId) {
                try {
                    const axiosResponse = await API.get<IApiResponse<ICcData>>(`result-get/${objectId}`);
                    const result = axiosResponse.data.data;

                    setResult(result);
                    setSelectedFile(extractSingleSimpleFile(result));
                    setError(undefined);
                } catch (error) {
                    setError({
                        name: "Not found",
                        errors: ["Solution was not found"]
                    });
                }
            }
        })();
    }, [user.id, counter, objectId]);

    const handleFileChange = async (file: ISimpleFile) => {
        if (!file.content) {
            file.content = <SimpleLoader />
            setSelectedFile(file);

            const response = await API.get(`file-get/${objectId}/${file.relPath}`);
            const { content } = response.data as any;
            file.content = content;
            setSelectedFile({ ...file });
        } else {
            setSelectedFile(file);
        }
    }

    if (error) {
        return renderError(error, 0, false);
    }

    if (!result) {
        return <SimpleLoader />
    }

    const { courseName, courseYear, problem, reviewRequest, points, result: mainResult } = result;
    const { userOrGroupUsers, groupName, user: username } = result;
    const { status, message, messages } = mainResult;
    const mainStatus = getStatus(status);
    const Icon = IconClass(result);
    const canEditResult = (user.id == result.user && result.isActive && result.points <= 0) || isRoot;
    const statusName = `status-${mainStatus.name}`;
    const extraCls = onClose == undefined
        ? "solution-result-view full-page"
        : "solution-result-view dialog-page";

    const requestCR = async () => {
        try {
            await API.get(`reviewrequest/${result.objectId}`);
            notifications.success(`Teacher notified!`);
            refresh();
            onChange();
        } catch (error) {
            notifications.error(`There was an error: ${error}`)
        }
    }

    const cancelCR = async () => {
        try {
            await API.delete(`reviewrequest/${result.objectId}`);
            notifications.success(`Ok`);
            refresh();
            onChange();
        } catch (error) {
            notifications.error(`There was an error: ${error}`)
        }
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

    return (<>
        <Container maxWidth={"lg"} className={extraCls}>
            <div className="solution-result-view">
                <div className={`solution-result-view-grid ${statusName}`}>
                    <div className="sol-inf sol-item">
                        <Typography variant="h4" className="hide-links pb1">
                            <CourseYearProblemHeader course={courseName} year={courseYear} problem={problem} />
                            <ChevronRightIcon color="disabled" />
                            <Typography variant="inherit" component={RouterLink} to={`r/${objectId}`}>#{result.attempt}</Typography>
                        </Typography>
                        <Typography variant="subtitle1" color="textSecondary">
                            Author(s):&nbsp;<strong>
                                {groupName && <>{groupName} ({userOrGroupUsers.map(humanizeName).join(", ")})</>}
                                {!groupName && <>{humanizeName(username)}</>}
                            </strong>
                        </Typography>

                        <Typography variant="subtitle1" color="textSecondary">
                            Duration:&nbsp;<strong>
                                {mainResult?.duration?.toFixed(3) ?? "??"} sec
                        </strong>
                        </Typography>

                        <Typography variant="subtitle1" color="textSecondary">
                            {reviewRequest && <>Review Request: &nbsp;
                            <strong><AbsMoment date={reviewRequest} /></strong>&nbsp;
                                {canEditResult && 
                                    <Button color="secondary" size="small" variant="text" onClick={cancelCR}>Cancel Review Request</Button>}
                            </>}
                            {!reviewRequest && <>No Review Request: <strong>
                                {canEditResult ?
                                    <Button color="primary" size="small" variant="text" onClick={requestCR}>Request now</Button> :
                                    <strong>cannot change, unsufficient permissions</strong>
                                }
                            </strong></>}
                        </Typography>
                    </div>
                    <div className="sol-sts sol-item">
                        {reviewRequest && <Button className="grade-btn" disabled={!isRoot} onClick={showGradeDialog}>
                            {points > 0 ? points : "??"}<small className="text-muted">/100</small>
                        </Button>}
                    </div>
                    <div className="sol-res sol-item">
                        <Typography variant="h6" className="sol-status">
                            <Icon />&nbsp;
                    <>{message ?? mainStatus.description} ({mainStatus.name})</>
                        </Typography>
                        <div className="sol-status-info pretty-scrollbar">
                            {messages?.length > 0 && <ol className="console">
                                {messages.join("\n").trimEnd().split("\n").map((i, j) => <li key={j}><pre>{i}</pre></li>)}
                            </ol>}
                        </div>
                    </div>
                    <div className="sol-sub sol-item">
                        {result.results?.length > 1 && <div className="subresults-wrapper">
                            <Typography variant="h6" className="sol-status">
                                <Icon />&nbsp;Subresults
                        </Typography>
                            <div className="sol-status-info">
                                <TimelineRenderer showExtra={isRoot} subresults={result.results} />
                            </div>
                        </div>}
                    </div>
                    <div className="sol-exp">
                        <SolutionResultViewTreeViewRoot onChange={handleFileChange} result={result} />
                    </div>
                    <div className="sol-src">
                        {selectedFile && <>
                            <Typography variant="h6" className="sol-status">
                                <DescriptionIcon />&nbsp;{selectedFile.filename}
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
                        <span className="filler" />
                        {comments.length > 0 && <Button onClick={postCommentsAndRefresh}>
                            Send {comments.length} comments
                    </Button>}
                    {onClose && <Button onClick={onClose}>Close</Button>}
                    </div>
                </div>
            </div>
        </Container>
        {gradeDialog && <SolutionResultViewGradeDialog
            onClose={hideGradeDialog}
            objectId={objectId} />}
    </>)
}
