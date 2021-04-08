import { Button, Card, Grid, Typography } from "@material-ui/core";
import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { ICourseProblem, ISingleCourse } from "../cc-api";
import { StatusMessage } from "../renderers/StatusMessageRenderer";
import { randomColorCss } from "../utils/randomcolor";




export interface PickerCourseBigTileProps {
    section: string;
    items: ISingleCourse[];
    defaultVisible: boolean;
    baseUrl: string;
}


export const PickerCourseBigTile = (props: PickerCourseBigTileProps) => {
    const { items, section, defaultVisible, baseUrl } = props;
    const [isVisible, setIsVisible] = useState(defaultVisible);

    const toggleVisibility = () => {
        setIsVisible(!isVisible);
    }

    return (<div className="picker-section">
        <Button className="picker-section-header" size="large" onClick={toggleVisibility}>
            <Typography>{section}</Typography>
            {!isVisible && <Typography color="textSecondary"><small>&nbsp;- {items.length} courses</small></Typography>}
        </Button>
        {isVisible && <Grid container spacing={2} className="card-select">
            {items.map((i, j) => {
                const fullname = `${baseUrl}/${i.course}/${i.year}`;
                return (<Grid item xs={12} sm={6} lg={3} key={j} className="picker-items">
                    <Card elevation={3}>
                        <div className="color-bar" style={randomColorCss(fullname)} />
                        <Button component={RouterLink} to={fullname}>
                            <div>
                                <Typography gutterBottom variant="h5" component="h2">
                                    {i.course} ({i.year})
                                </Typography>
                                <Typography variant="body2" color="textSecondary" component="p">
                                    {i.problems.length} problem{i.problems.length == 1 ? "" : "s"} available
                                </Typography>
                            </div>
                        </Button>
                    </Card>
                </Grid>)
            })}
        </Grid>}
    </div>)
}

interface PickerProblemBigTileProps {
    items: ICourseProblem[];
    baseUrl: string;
}

export const PickerProblemBigTile = (props: PickerProblemBigTileProps) => {
    const { items, baseUrl } = props;


    return (<div className="picker-section">
        <Grid container spacing={2} className="card-select card-select-problem">
            {items.map((i, j) => {
                const fullname = `${baseUrl}/${i.course}/${i.year}/${i.id}`;
                return (<Grid item xs={12} sm={6} lg={4} key={j} className="picker-items fade-in">
                    <Card elevation={3}>
                        <div className="color-bar" style={randomColorCss(fullname)} />
                        <Typography variant="body2" className="card-footer" color="textSecondary" component="small">
                                <StatusMessage problem={i} />
                            </Typography>
                        <Button component={RouterLink} to={fullname} onClick={() => null}>
                            <div>
                                <Typography gutterBottom variant="h6" component="h2">
                                    {i.name}
                                </Typography>
                                {/* <Typography variant="body2" color="textSecondary" component="p">
                                    {sc.problems.length} problem{sc.problems.length == 1 ? "" : "s"} available
                                </Typography> */}
                            </div>
                        </Button>
                    </Card>
                </Grid>)
            })}
        </Grid>
    </div>)
}