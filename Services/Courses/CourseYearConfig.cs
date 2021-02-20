using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Serialization;
using CC.Net.Collections;
using YamlDotNet.Serialization;

namespace CC.Net.Services.Courses
{
    public class CourseYearConfig: IUpdateRefs<Course>
    {
        public string Year { get; set; }
        public List<List<CcData>> Results { get; set; } = new List<List<CcData>>();
        public List<CourseProblem> Problems { get; set; } = new List<CourseProblem>();
        public SettingsConfig SettingsConfig { get; set; }

        [JsonIgnore]
        [YamlIgnore]
        public string Yaml { get; set; }


        [JsonIgnore]
        [YamlIgnore]
        public Course Course { get; set; }


        public IEnumerable<CourseProblem> GetAllowedProblemForUser(AppUser user)
        {
            foreach(var problem in Problems)
            {
                yield return problem;
            }
        }

        public void UpdateRefs(Course instance)
        {
            Course = instance;
            Problems.ForEach(i => i.UpdateRefs(this));

            if (SettingsConfig == null)
            {
                SettingsConfig = CreateDummySettingsConfig(this);
            }
        }

        public static SettingsConfig CreateDummySettingsConfig(CourseYearConfig courseYearConfig)
        {
            var dummy = new SettingsConfig();
            var course = courseYearConfig.Course;
            dummy.Teachers = course.CourseConfig.Teachers
                .Select(i =>
                new SettingsConfigTeacher
                {
                    Id = i.id,
                    Tags = i.Tags,
                    Students = course.CourseConfig.Students,
                    Problems = courseYearConfig.Problems.Select(j => j.Id).ToList(),
                }).ToList();

            return dummy;
        }

        public CourseProblem this[string key]
        {
            get => Problems.FirstOrDefault(i => i.Id.ToLower() == key.ToLower());
        }
    }
}