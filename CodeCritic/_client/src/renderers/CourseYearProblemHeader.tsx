import * as React from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { Typography } from '@material-ui/core';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

interface CourseYearProblemHeaderProps {
    course: string;
    year: string;
    problem: string;
}
export const CourseYearProblemHeader = (props: CourseYearProblemHeaderProps) => {
    const { course, year, problem } = props;
    return (<>
        <Typography variant="inherit" component={RouterLink} to={`/courses/${course}`}>{course}</Typography>
        <ChevronRightIcon color="disabled" />
        <Typography variant="inherit" component={RouterLink} to={`/courses/${course}/${year}`}>{year}</Typography>
        <ChevronRightIcon color="disabled" />
        <Typography variant="inherit" component={RouterLink} to={`/courses/${course}/${year}/${problem}`}>{problem}</Typography>
    </>)
}