import { SolutionSubmit } from "./routes/SolutionSubmit";
import { StudentResultList } from "./routes/StudentResultList";
import { CourseProblemSelector } from "./components/CourseProblemSelector";
import { Home } from "./components/Home";

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
    // {
    //     title: "Problem-Student Matrix",
    //     to: "/problem-student-matrix",
    //     path: "/problem-student-matrix/:course?/:year?",
    //     exact: false,
    //     component: ProblemStudentMatrixList,
    //     rootOnly: true,
    // },
    {
        title: "View Results",
        to: "/view-results",
        path: "/view-results",
        exact: true,
        component: StudentResultList,
        rootOnly: true,
    },
    {
        title: "Submit Solution",
        to: "/courses",
        path: "/courses/:course?/:year?/:problem?",
        exact: false,
        component: SolutionSubmit,
        rootOnly: false,
    }
];
