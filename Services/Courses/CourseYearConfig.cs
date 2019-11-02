using System.Collections.Generic;
using System.Linq;
using CC.Net.Entities;

namespace CC.Net.Services.Courses
{
    public class CourseYearConfig
    {
        public string Year { get; set; }
        public List<CourseProblem> Problems { get; set; }

        public CourseProblem this[string key]
        {
            get => Problems.First(i => i.id.ToLower() == key.ToLower());
        }
    }
}