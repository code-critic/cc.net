using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json.Serialization;
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

    public enum SubmissionStatus {
        Unkown = 0,
        Intime = 1,
        Late = 2,
        None = 3,
    }

    public class CourseProblem: IUpdateRefs<CourseYearConfig>
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

        [YamlMember(Alias = "collaboration")]
        public CourseProblemCollaborationConfig Collaboration { get; set; }

        public bool GroupsAllowed => Collaboration?.Enabled == true;

        public IEnumerable<CourseProblemCase> AllTests =>
            Tests.SelectMany(i => i.Enumerate());

        public CourseProblemCase this[string key]
        {
            get => AllTests.FirstOrDefault(i => i.Id.ToLower() == key.ToLower());
        }

        public string Description { get; set; }

        public CourseProblem AddDescription(ProblemDescriptionService problemDescriptionService, SingleCourse course)
        {
            Description = problemDescriptionService.GetProblemReadMe(this, course);
            return this;
        }

        public FileTree ProblemDir()
        {
            return new FileTree(Path.Combine(CourseYearConfig.Course.CourseDir, CourseYearConfig.Year, "problems", Id));
        }

        [JsonIgnore]
        [YamlIgnore]
        public CourseYearConfig CourseYearConfig { get; set; }

        public void UpdateRefs(CourseYearConfig instance)
        {
            CourseYearConfig = instance;
        }


        public class CourseProblemCollaborationConfig
        {
            [YamlMember(Alias = "enabled")]
            public bool Enabled { get; set; } = true;
            
            [YamlMember(Alias = "min-size")]
            public int MinSize { get; set; } = 1;
            
            [YamlMember(Alias = "max-size")]
            public int MaxSize { get; set; } = 3;
        }
    }
}