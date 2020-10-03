using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using CC.Net.Utils;
using YamlDotNet.Serialization;

namespace CC.Net.Services.Courses
{

    public class CourseProblem
    {
        [YamlMember(Alias = "unittest")]
        public bool Unittest { get; set; }

        [YamlMember(Alias = "libname")]
        public string Libname { get; set; }

        [YamlMember(Alias = "id")]
        public string Id { get; set; }

        [YamlMember(Alias = "name")]
        public string Name { get; set; }

        [YamlMember(Alias = "cat")]
        public string Cat { get; set; }

        [YamlMember(Alias = "timeout")]
        public double Timeout { get; set; }

        [YamlMember(Alias = "avail")]
        public DateTime Avail { get; set; } = DateTime.MaxValue;

        [YamlMember(Alias = "since")]
        public DateTime Since { get; set; } = DateTime.MinValue;

        public bool IsActive => DateTime.Now > Since && DateTime.Now <= Avail;


        [YamlMember(Alias = "include")]
        public List<string> Include { get; set; } = new List<string>();

        [YamlMember(Alias = "assets")]
        public List<string> Assets { get; set; } = new List<string>();

        [YamlMember(Alias = "export")]
        public List<string> Export { get; set; } = new List<string>();



        [YamlMember(Alias = "reference")]
        public CourseReference Reference { get; set; }

        [YamlMember(Alias = "tests")]
        public List<CourseProblemCase> Tests { get; set; }

        public IEnumerable<CourseProblemCase> AllTests =>
            Tests.SelectMany(i => i.Enumerate());

        public CourseProblemCase this[string key]
        {
            get => AllTests.First(i => i.Id.ToLower() == key.ToLower());
        }

        public string Description { get; set; }

        public CourseProblem AddDescription(ProblemDescriptionService problemDescriptionService, SingleCourse course)
        {
            Description = problemDescriptionService.GetProblemReadMe(this, course);
            return this;
        }

        public FileTree ProblemDir()
        {
            return new FileTree(Path.Combine(_course.CourseDir, _yearConfig.Year, "problems", Id));
        }



        private Course _course;
        private CourseYearConfig _yearConfig;
        public void SetCourse(Course course, CourseYearConfig yearConfig)
        {
            _course = course;
            _yearConfig = yearConfig;
        }
    }
}