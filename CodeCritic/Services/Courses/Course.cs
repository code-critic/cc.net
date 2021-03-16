using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Serialization;

namespace CC.Net.Services.Courses
{
    public class Course
    {
        public string Name => CourseConfig.Name;

        public CourseConfig CourseConfig { get; set; }
        public List<CourseYearConfig> CourseYears { get; set; }
        public string CourseDir { get; set; }

        public CourseYearConfig this[string key]
        {
            get => CourseYears.FirstOrDefault(i => i.Year.ToLower() == key.ToLower());
        }

        [JsonIgnore]
        public string Yaml { get; set; }

        public List<string> Errors { get; set; } = new List<string>();
    }
}