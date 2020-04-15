import { SolutionSubmit } from "./routes/SolutionSubmit";
import { ProblemStudentMatrixList } from "./routes/ProblemStudentMatrixList";
import { StudentResultList } from "./routes/StudentResultList";
import { Home } from "./components/Home";

export interface IPageLink<T> {
    title: string;
    to: string;
    path: string;
    exact: boolean;
    component: React.ComponentType<T>;
}

export const pageLinks: IPageLink<any>[] = [
    {
        title: "Home",
        to: "/",
        path: "/",
        exact: true,
        component: Home,
    },
    {
        title: "Problem-Student Matrix",
        to: "/problem-student-matrix",
        path: "/problem-student-matrix/:course?/:year?",
        exact: false,
        component: ProblemStudentMatrixList,
    },
    {
        title: "View Results",
        to: "/view-results",
        path: "/view-results",
        exact: true,
        component: StudentResultList,
    },
    {
        title: "Submit Solution",
        to: "/courses",
        path: "/courses/:course?/:year?/:problem?",
        exact: false,
        component: SolutionSubmit,
    }
];
