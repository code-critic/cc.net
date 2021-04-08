import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import {
    Button, Container, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography,
} from '@material-ui/core';
import ClearIcon from '@material-ui/icons/Clear';
import DoneIcon from '@material-ui/icons/Done';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import PriorityHighIcon from '@material-ui/icons/PriorityHigh';

import { CodeCritic } from '../api';
import { IStudentScoreboardCourse } from '../cc-api';
import { SimpleLoader } from '../components/SimpleLoader';
import { groupBy } from '../utils/arrayUtils';

interface ScoreBoardIconProps {
    icon: any;
    children: any;
    to: string;
}
const ScoreBoardIcon = (props: ScoreBoardIconProps) => {
    const { icon: IconCls, children, to } = props;

    return (<Typography component={RouterLink} to={to}>
        <div><IconCls /></div>
        {children}
    </Typography>)
}
interface TableCellRendererProps {
    result: IStudentScoreboardCourse;
}
const TableCellRenderer = (props: TableCellRendererProps) => {
    const { score, resultCount, courseYear, courseName, problem, objectId } = props.result;
    const className = score === -1
        ? resultCount > 0
            ? "forgot-code-review"
            : "no-code-review"
        : score === 0
            ? "ok-code-review"
            : "ok-code-review";

    const msg = score === -1
        ? resultCount > 0
            ? <ScoreBoardIcon to={`/courses/${courseName}/${courseYear}/${problem}`} icon={PriorityHighIcon}>Code Review <small>missing</small></ScoreBoardIcon>
            : <ScoreBoardIcon to={`/courses/${courseName}/${courseYear}/${problem}`} icon={ClearIcon}>No Solution</ScoreBoardIcon>
        : score === 0
            ? <ScoreBoardIcon to={`/r/${objectId}`} icon={DoneIcon}>?<small> of 100</small></ScoreBoardIcon>
            : <ScoreBoardIcon to={`/r/${objectId}`} icon={DoneAllIcon}>{Math.round(score)}<small> of 100</small></ScoreBoardIcon>

    const tooltip = score === -1
        ? resultCount > 0
            ? `Mark one of the ${resultCount} solution(s) for Code Review`
            : "You have not submitted a solution which passed all tests"
        : score === 0
            ? `Solution was not yet graded`
            : `Your grade ${Math.round(score)} / 100`;


    return (<Tooltip title={tooltip}>
        <TableCell className={className}>
            {msg}
        </TableCell>
    </Tooltip>)
}
interface StudentScoreboardProps {

}
export const StudentScoreboard = (props: StudentScoreboardProps) => {
    const [items, setItems] = useState<IStudentScoreboardCourse[]>();

    useEffect(() => {
        (async () => {
            const axiosResponse = await CodeCritic.api.studentScoreboardList();
            setItems(axiosResponse.data);
        })()
    }, [ ]);

    if (items === undefined) {
        return <SimpleLoader title="loading" />
    }

    if (!items.length) {
        return <div>no results</div>
    }

    const byYear = groupBy(items, i => i.courseYear);

    return (<Container maxWidth="xl" style={{overflowX: "auto"}} className="scoreboard-container">
        {[...byYear.entries()].map(([courseYear, yearItems]) => {
            const byCourseName = [...groupBy(yearItems, i => i.courseName).entries()];

            return <>
                <div>{byCourseName.map(([courseName, courseNameItems]) => {
                    const byProblem = groupBy(courseNameItems, i => i.problem);
                    const problemsNames = [...byProblem.keys()];
                    return <>
                        <Typography component={RouterLink} variant="h4" to={`/courses/${courseName}/${courseYear}`} className="course">
                            {courseName}/{courseYear}
                        </Typography>
                        <Table className="scoreboard code-review">
                            <TableHead>
                                <TableRow>
                                    {problemsNames.map(i => <TableCell key={i}>
                                        <Button variant="text" component={RouterLink} to={`/courses/${courseName}/${courseYear}/${i}`} fullWidth>{i}</Button>
                                    </TableCell>)}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    {[...courseNameItems].map((i, j) => <TableCellRenderer key={j} result={i} />)}
                                </TableRow>
                            </TableBody>
                        </Table>
                    </>
                })}</div>
            </>
        })}

        <div className="legend">
            <hr />
            <h1 className="course">Legend</h1>
            <Table className="scoreboard code-review">
                <TableBody>
                    <TableRow>
                        <TableCell className="ok-code-review legend-icon"><DoneAllIcon /></TableCell>
                        <TableCell>Submitted solution was accepted and graded</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="ok-code-review legend-icon"><DoneIcon /></TableCell>
                        <TableCell>Submitted solution was accepted, waiting to be graded</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="forgot-code-review legend-icon"><PriorityHighIcon /></TableCell>
                        <TableCell>You have submitted at least one solution which passed but did not send Code Review request</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="no-code-review legend-icon"><ClearIcon /></TableCell>
                        <TableCell>You have not submitted a solution which passed all the test</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    </Container>)
}