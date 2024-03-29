import { Breadcrumbs, Link, Typography } from "@material-ui/core";
import ExtensionIcon from '@material-ui/icons/Extension';
import HomeIcon from '@material-ui/icons/Home';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import SchoolIcon from '@material-ui/icons/School';
import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { ICourseProblem, ISingleCourse } from "../cc-api";


interface RenderBreadcrumbsProps {
    baseUrl: string;
    home?: JSX.Element;

    activeCourse?: ISingleCourse;
    activeProblem?: ICourseProblem;
    customRenderer?: React.ComponentType<any>;
}

export const RenderBreadcrumbs = (props: RenderBreadcrumbsProps) => {
    const { activeCourse, activeProblem, baseUrl, home, customRenderer } = props;
    const CustomRenderer = customRenderer as any;

    const breadcrumbComponents = [{
        to: `${baseUrl}`,
        title: home ?? <><HomeIcon fontSize="small" /> Courses</>
    }];
    if (activeCourse) {
        breadcrumbComponents.push({
            to: `${baseUrl}/${activeCourse.course}/${activeCourse.year}`,
            title: <><SchoolIcon fontSize="small" /> {`${activeCourse.course}-${activeCourse.year}`}</>
        });
    }

    if (activeCourse && activeProblem) {
        breadcrumbComponents.push({
            to: `${baseUrl}/${activeCourse.course}/${activeCourse.year}/${activeProblem.id}`,
            title: <><ExtensionIcon fontSize="small" /> {`${activeProblem.name}`}</>
        });
    }

    const last = breadcrumbComponents.length - 1;
    return <Breadcrumbs aria-label="breadcrumb" separator={<NavigateNextIcon fontSize="small" />} className="breadcrumb">
        {breadcrumbComponents.map((i, j) => {
            if (j == last) {
                return <Typography key={j} color="textPrimary">{i.title}</Typography>
            }
            return <Link key={j} to={i.to} component={RouterLink} className="display-flex">{i.title}</Link>
        })}
        {CustomRenderer && <CustomRenderer course={activeCourse} problem={activeProblem}  />}
    </Breadcrumbs>
}