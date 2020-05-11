using System.Collections.Generic;
using System.IO;
using System.Linq;
using CC.Net.Utils;

namespace CC.Net.Services.Courses
{
    public class CourseYearConfig
    {
        public string Year { get; set; }
        public List<CourseProblem> Problems { get; set; }
        public CourseProblem this[string key]
        {
            get => Problems.First(i => i.Id.ToLower() == key.ToLower());
        }


        private Course _course;
        public void SetCourse(Course course)
        {
            _course = course;
            Problems.ForEach(i => i.SetCourse(_course, this));
        }
    }
}