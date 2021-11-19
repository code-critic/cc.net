import React, { useContext, useEffect, useState } from 'react';
import { GradeResultsCourseImpl } from './GradeResultsCourseImpl';
import { GradeResultsProblemImpl } from './GradeResultsProblemImpl';
import { ProblemPickerExportProps } from './ProblemPicker';

export interface GradeResultsForkProps extends ProblemPickerExportProps { }
export const GradeResultsFork = (props: GradeResultsForkProps) => {
    const { course, problem } = props;
    if (!course && !problem) {
        return <></>;
    }

    if (course && !problem) {
        return <GradeResultsCourseImpl {...props} />;
    }

    return <GradeResultsProblemImpl {...props} />;
};