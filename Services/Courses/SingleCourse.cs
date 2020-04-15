using System.Collections.Generic;

namespace CC.Net.Services.Courses
{
    public class SingleCourse
    {
        public string Course { get; set; }
        public string Year { get; set; }
        public CourseConfig CourseConfig { get; set; }
        public List<CourseProblem> Problems { get; set; }
    }
}