using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json.Serialization;
using CC.Net.Attributes;
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

    public static class SubmissionStatusExtensions {
        public static SubmissionStatus ParseSubmissionStatus(this string status) {
            var value = status.ToUpper();
            switch(value){
                case "IN":
                    return SubmissionStatus.Intime;
                case "AF":
                case "LA":
                    return SubmissionStatus.Late;
            }
            
            return Enum.TryParse<SubmissionStatus>(status, true, out var parsed)
                ? parsed : SubmissionStatus.Unkown;
        }
    }

    public partial class CourseProblem: IUpdateRefs<CourseYearConfig>
    {
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

        public bool GroupsAllowed => Collaboration?.Enabled == true;

        public IEnumerable<CourseProblemCase> AllTests =>
            Tests.SelectMany(i => i.Enumerate());

        public CourseProblemCase this[string key] => 
            AllTests.FirstOrDefault(i => i.Id.ToLower() == key.ToLower());

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

        public string Course => CourseYearConfig?.Course.Name;
        public string Year => CourseYearConfig?.Year;
    }
    
    public class CourseProblemCollaborationConfig
    {
        [Doc("If enabled, teams can be used")]
        [YamlMember(Alias = "enabled")]
        public bool Enabled { get; set; } = true;
            
        [Doc("Minimum size of the team, default `1`")]
        [YamlMember(Alias = "min-size")]
        public int MinSize { get; set; } = 1;
        
        [Doc("Maximum size of the team, default `3`")]
        [YamlMember(Alias = "max-size")]
        public int MaxSize { get; set; } = 3;
    }
}