using System.Collections.Generic;
using System.Linq;

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
            get => CourseYears.First(i => i.Year.ToLower() == key.ToLower());
        }
    }
}