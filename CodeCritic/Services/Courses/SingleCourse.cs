using System.Collections.Generic;
using Cc.Net.Apis;

namespace CC.Net.Services.Courses
{
    public class SingleCourse
    {
        public Course CourseRef { get; set; }
        public string Course { get; set; }
        public string Year { get; set; }
        public CourseConfig CourseConfig { get; set; }
        public List<CourseProblem> Problems { get; set; }
        public SettingsConfig SettingsConfig { get; set; }
    }
}