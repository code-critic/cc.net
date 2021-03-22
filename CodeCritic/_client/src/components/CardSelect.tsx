import { Button, Card, Grid, Link, Typography } from '@material-ui/core';
import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { ICourse, ISingleCourse } from "../models/DataModel";
import { flattenCourse } from "../utils/DataUtils";


type ElOrStr = JSX.Element | string;

export const CourseSelect = (
    courses: ICourse[],
    link: (item: ISingleCourse) => string,
    onClick?: (item: ISingleCourse) => void,
    title: (item: ISingleCourse) => ElOrStr = i => i.course,
) => {
    return <ul>
        {
            courses
                .flatMap(flattenCourse)
                .map(i =>
                    <li key={`${i.course}/${i.year}`}>
                        <Link component={RouterLink} to={link(i)} onClick={() => onClick ? onClick(i) : null}>
                            {title(i)}
                        </Link>
                    </li>
                )
        }
    </ul>
}

export const CardSelect = <T extends any>(
    courses: T[],
    link: (item: T) => string,
    onClick: (item: T) => void,
    title: (item: T) => ElOrStr,
    text?: (item: T) => ElOrStr,
    footer?: (item: T) => ElOrStr,
) => {
    return <Grid container spacing={2} className="card-select">
        {
            courses
                .map(i =>
                    <Grid key={link(i)} item xs={12} sm={6} lg={3} >
                        <Card elevation={3}>
                            <Button component={RouterLink} to={link(i)} onClick={() => onClick(i)}>
                                <div>
                                    <Typography gutterBottom variant="h5" component="h2">
                                        {title(i)}
                                    </Typography>
                                    {text && <Typography variant="body2" color="textSecondary" component="p">
                                        {text(i)}
                                    </Typography>}
                                </div>
                            </Button>
                            {footer && <Typography variant="body2" className="card-footer" color="textSecondary" component="small">
                                {footer(i)}
                            </Typography>}
                        </Card>
                    </Grid>
                )
        }
    </Grid>
}