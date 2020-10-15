using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using CC.Net.Collections;
using CC.Net.Utils;
using YamlDotNet.Serialization;

namespace CC.Net.Services.Courses
{
    public class CourseYearConfig
    {
        public string Year { get; set; }
        public List<List<CcData>> Results { get; set; } = new List<List<CcData>>();
        public List<CourseProblem> Problems { get; set; }

        private Course _course;
        public void SetCourse(Course course)
        {
            _course = course;
            Problems.ForEach(i => i.SetCourse(_course, this));
        }

        public IEnumerable<CourseProblem> GetAllowedProblemForUser(AppUser user)
        {
            foreach(var problem in Problems)
            {
                yield return problem;
            }
        }

        public CourseProblem this[string key]
        {
            get => Problems.First(i => i.Id.ToLower() == key.ToLower());
        }
    }
}