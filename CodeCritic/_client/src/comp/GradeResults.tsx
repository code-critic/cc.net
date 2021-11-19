import React, { createContext, useContext, useState } from 'react';

import { Checkbox, FormControlLabel } from '@material-ui/core';
import InsertChartIcon from '@material-ui/icons/InsertChart';

import { IGradeStatFilterDto } from '../cc-api';
import { ProblemPicker, ProblemPickerExportProps } from './ProblemPicker';
import { GradeResultsFork } from './GradeResultsFork';


export interface IGradeStatFilterContext {
    context: IGradeStatFilterDto,
    setContext?(value: any): void,
}
const GradeStatFilterContext: IGradeStatFilterContext = {
    context: { showMissingGradeOnly: false },
};
export const FilterContext = createContext<any>(GradeStatFilterContext);

const CustomBreadcrumbRenderer = (props: ProblemPickerExportProps) => {
    const { course, problem } = props;
    const { context, setContext } = useContext(FilterContext) as IGradeStatFilterContext;

    if (!course || !problem) {
        return <></>
    }

    const handleChange = () => {
        setContext({ showMissingGradeOnly: !context.showMissingGradeOnly})
    }
    return <div>
        <FormControlLabel
            control={<Checkbox 
                color="primary"
                checked={context.showMissingGradeOnly} 
                onChange={handleChange} title="missing grade only" />}
            label="missing grade only"
            />
    </div>
}

export const Graderesults = () => {
    const [context, setContext] = useState(GradeStatFilterContext.context);

    return <div>
        <FilterContext.Provider value={{ context, setContext }} >
            <ProblemPicker
                baseUrl="/grade-results"
                home={<><InsertChartIcon />Grade</>}
                component={GradeResultsFork}
                withBreadcrumbs={CustomBreadcrumbRenderer}
                whereUserIsTeacher
                displayAlways
            />
        </ FilterContext.Provider>
    </div>
}