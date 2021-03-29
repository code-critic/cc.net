import { Box, Button, Tooltip, Typography } from "@material-ui/core";
import React, { useEffect, useState } from "react";

import { API } from "../api";
import GradeIcon from '@material-ui/icons/Grade';
import { IApiListResponse } from "../models/CustomModel";
import { ICcData } from "../models/DataModel";
import { IconClass } from "../renderers/IconClass";
import { ProblemPickerExportProps } from "./ProblemPicker";
import { Link as RouterLink } from "react-router-dom";
import { SimpleLoader } from "../components/SimpleLoader";
import { getStatus } from "../utils/StatusUtils";
import { useUser } from "../hooks/useUser";

interface SubmitSolutionLastResultsProps extends ProblemPickerExportProps {
}



export const SubmitSolutionLastResults = (props: SubmitSolutionLastResultsProps) => {
    const { problem } = props;
    const [results, setResults] = useState<ICcData[]>();
    const { user, isRoot, isStudent, canBeRoot, canBeStudent } = useUser();

    useEffect(() => {
        (async () => {
            const url = `user-problem-results/${problem.course}/${problem.year}/${problem.id}/${user.id}`;
            const axiosResponse = await API.get<IApiListResponse<ICcData>>(url);
            const responseData = axiosResponse.data;
            setResults(responseData.data);
        })()
    }, [user.id]);

    if (results == null) {
        return <SimpleLoader title="loading latest results" />
    }

    return (<div>
        {!results.length && <Typography color="textSecondary">
            No results found
        </Typography>}
        <div className="latest-result-wrapper">
            <Box display="flex" className="latest-results">
                {results.length && results.map((i, j) => {
                    const status = getStatus(i.result.status);
                    const IconCls = IconClass(i);

                    return (<Tooltip key={j} title={status.description} enterDelay={0} arrow>
                        <Button component={RouterLink} to={`/r/${i.objectId}`} className={`icon-text-button ${status.name}`}>
                            {i.reviewRequest && <div className="cr marker">
                                <GradeIcon />
                            </div>}
                            <div className="icon"><IconCls /></div>
                            <div className="text">#{i.attempt}</div>
                        </Button>
                    </Tooltip>)
                })}
            </Box>
        </div>
    </div>)
}
