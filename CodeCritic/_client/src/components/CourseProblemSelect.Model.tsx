import { ICourse, ICourseProblem, ILanguage, ISingleCourse } from "../models/DataModel";
import { ApiResource } from "../utils/ApiResource";
import { flattenCourse } from "../utils/DataUtils";

export class CourseProblemSelectModel {

    courses: ApiResource<ICourse> = new ApiResource<ICourse>("courses", false);

    languages: ApiResource<ILanguage> = new ApiResource<ILanguage>("languages", false);

    problems: ApiResource<ICourseProblem> = new ApiResource<ICourseProblem>("---", false);

    public onProblemChanged = () => console.log(1)

    public get singleCourses(): ISingleCourse[] {
        return this.courses ? this.courses.data.flatMap(flattenCourse) : [];
    }

    public course(name: string, year: string) {
        return this.singleCourses.find(i => i.year === year && i.course === name);
    }

    public problem(id: string) {
        return this.problems && this.problems.data ? this.problems.data.find(i => i.id === id) : undefined;
    }
}