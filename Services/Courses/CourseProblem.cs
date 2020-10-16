using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using CC.Net.Utils;
using YamlDotNet.Serialization;

namespace CC.Net.Services.Courses
{
    public enum ProblemStatus
    {
        BeforeStart = 0,
        Active = 1,
        ActiveLate = 2,
        AfterDeadline = 3,
    }

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

        [YamlMember(Alias = "deadline")]
        public DateTime Deadline { get; set; } = DateTime.MaxValue;

        public ProblemStatus StatusCode =>
            DateTime.Now < Since
                ? ProblemStatus.BeforeStart 
                : DateTime.Now >= Since && DateTime.Now < Avail
                    ? ProblemStatus.Active
                    : DateTime.Now >= Avail && DateTime.Now < Deadline
                        ? ProblemStatus.ActiveLate
                        : ProblemStatus.AfterDeadline;

        public string Status => StatusCode.ToString();

        public bool IsActive => StatusCode == ProblemStatus.Active || StatusCode == ProblemStatus.ActiveLate;


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