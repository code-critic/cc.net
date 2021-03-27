import * as React from 'react';

import { IApiError, ICcData } from '../models/DataModel';
import { useEffect, useState } from 'react';

import { API } from '../api';
import { AbsMoment } from '../renderers/AbsMoment';
import { Button } from '@material-ui/core';
import { CourseYearProblemHeader } from '../renderers/CourseYearProblemHeader';
import Moment from 'react-moment';
import { Link as RouterLink } from "react-router-dom";
import { SimpleLoader } from '../components/SimpleLoader';
import { Typography } from '@material-ui/core';
import { getStatus } from '../utils/StatusUtils';
import { renderError } from '../renderers/renderErrors';
import { useParams } from 'react-router';
import { useRefresh } from '../hooks/useRefresh';
import { useUser } from '../hooks/useUser';

interface IParamsObjectId {
    objectId?: string;
}

interface SolutionResultViewProps extends IParamsObjectId {
}

export const SolutionResultView = (props: SolutionResultViewProps) => {
    const objectId = props.objectId ?? useParams<IParamsObjectId>().objectId;
    const { user, isRoot, isStudent, canBeRoot, canBeStudent } = useUser();
    const [result, setResult] = useState<ICcData>();
    const { counter, refresh } = useRefresh();
    const [error, setError] = useState<IApiError>();

    useEffect(() => {
        (async () => {
            if (objectId) {
                try {
                    const axiosResponse = await API.get<ICcData>(`result/${objectId}`);
                    setResult(axiosResponse.data);
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

    if (error) {
        return renderError(error, 0, false);
    }

    if (!result) {
        return <SimpleLoader />
    }

    const { courseName, courseYear, problem, reviewRequest, points, result: mainResult } = result;
    const { userOrGroupUsers, groupName, user: username } = result;
    const { status } = mainResult;

    return (<div className="solution-result-view">
        <div className="solution-result-view-grid">
            <div className="sol-inf">
                <Typography variant="h5" className="hide-links">
                    <CourseYearProblemHeader course={courseName} year={courseYear} problem={problem} />
                </Typography>
                <Typography variant="subtitle1" color="textSecondary">
                    Author(s):&nbsp;<strong>
                        {groupName && <>{groupName} ({userOrGroupUsers.join(", ")})</>}
                        {!groupName && <>{username}</>}
                    </strong>
                </Typography>
                <Typography variant="subtitle1" color="textSecondary">
                    {reviewRequest && <>Review Request: <strong><AbsMoment date={reviewRequest} /></strong></>}
                    {!reviewRequest && <>Review Request: <strong>
                        Not requested
                        <Button variant="text">Request now</Button>
                    </strong></>}
                </Typography>
            </div>
            <div className="sol-sts">
                {reviewRequest && <div>
                    {points > 0 && <>{points}<small className="text-muted">/100</small></>}
                    {points <= 0 && <>??<small className="text-muted">/100</small></>}
                </div>}
            </div>
            <div className="sol-res">
                {getStatus(status).description}
            </div>
            <div className="sol-sub"></div>
            <div className="sol-exp"></div>
            <div className="sol-src"></div>
            <div className="sol-btn"></div>
        </div>
    </div>)
}