import { Container, Grid } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { ICcData } from "../models/DataModel";
import { ProblemPicker, ProblemPickerExportProps } from "./ProblemPicker";
import { SubmitSolutionLastResults } from "./SubmitSolution.LastResults";
import "../third_party/mathjax";

interface SubmitSolutionProps extends ProblemPickerExportProps {
}


export const SubmitSolution = (props: SubmitSolutionProps) => {
    return (<Container maxWidth="lg">
        <ProblemPicker
            component={SubmitSolutionImpl}
            baseUrl="/courses"
            tileStyle="big"
            withBreadcrumbs
        />
    </Container>)
}

export const SubmitSolutionImpl = (props: SubmitSolutionProps) => {
    const { course, problem } = props;

    useEffect(() => {
        const MathJax = (window as any).MathJax;
        if (MathJax && MathJax.typeset) {
            MathJax.typeset();
        }
    });

    return <Grid container spacing={2}>
        {/* top info */}
        <Grid item xs={12} style={{padding: 0}}>
            <SubmitSolutionLastResults course={course} problem={problem} />
        </Grid>

        {/* left half */}
        <Grid item xs={12} md={6}>
            <div dangerouslySetInnerHTML={{ __html: problem.description }} />
        </Grid>

        {/* right half */}
        <Grid item xs={12} md={6}>

        </Grid>
    </Grid>
}
