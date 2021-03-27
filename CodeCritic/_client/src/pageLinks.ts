import { Graderesults } from "./comp/GradeResults";
import { SolutionResultView } from "./comp/SolutionResultView";
import { StudentScoreboard } from "./comp/StudentScoreboard";
import { SubmitSolution } from "./comp/SubmitSolution";
import { ViewResults } from "./comp/ViewResults";

export interface IPageLink<T> {
    title: string;
    to: string;
    path: string;
    exact: boolean;
    component: React.ComponentType<T>;
    rootOnly: boolean;
}

export const pageLinks: IPageLink<any>[] = [
    {
        title: "Home",
        to: "/",
        path: "/:objectId?",
        exact: false,
        // component: SolutionSubmit,
        component: SolutionResultView,
        rootOnly: false,
    },
    {
        title: "Results",
        to: "/results",
        path: "/results",
        exact: true,
        component: StudentScoreboard,
        rootOnly: false,
    },
    // {
    //     title: "Stats",
    //     to: "/stats",
    //     path: "/stats",
    //     exact: true,
    //     component: GlobalStats,
    //     rootOnly: false,
    // },
    {
        title: "View Results",
        to: "/view-results",
        path: "/view-results/:course?/:year?/:problem?",
        exact: false,
        component: ViewResults,
        rootOnly: true,
    },
    {
        title: "Grade Results",
        to: "/grade-results",
        path: "/grade-results/:course?/:year?/:problem?",
        exact: true,
        component: Graderesults,
        rootOnly: true,
    },
    {
        title: "Submit Solution",
        to: "/courses",
        path: "/courses/:course?/:year?/:problem?",
        exact: false,
        // component: SolutionSubmit,
        component: SubmitSolution,
        rootOnly: false,
    }
];
