using System.Collections.Generic;
using System.Linq;

namespace CC.Net.Services.Courses
{

    public class CourseProblem
    {
        public string id { get; set; }
        public string name { get; set; }
        public string cat { get; set; }
        public double timeout { get; set; }
        public string avail { get; set; }
        public string since { get; set; }
        public CourseReference reference { get; set; }
        public List<CourseProblemCase> tests { get; set; }

        public CourseProblemCase this[string key]
        {
            get => tests.First(i => i.id.ToLower() == key.ToLower());
        }

        public string Description { get; set; }

        public CourseProblem AddDescription(ProblemDescriptionService problemDescriptionService, SingleCourse course)
        {
            Description = problemDescriptionService.GetProblemReadMe(this, course);
            return this;
        }
    }
}