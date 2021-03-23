import { Graderesults } from "./comp/GradeResults";
import { ViewResults } from "./comp/StudentResultListNew";
import { StudentScoreboard } from "./comp/StudentScoreboard";
// import { Graderesults } from "./components/gradeResults";
import { SolutionSubmit } from "./routes/SolutionSubmit";

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
        path: "/",
        exact: true,
        component: SolutionSubmit,
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
        component: SolutionSubmit,
        // component: SubmitSolutionWithComponent,
        rootOnly: false,
    }
];
