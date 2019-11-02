using System.Collections.Generic;
using System.Linq;

namespace CC.Net.Services.Courses
{
    public class CourseReference
    {
        public string name { get; set; }
        public string lang { get; set; }

        // public CourseProblemTest this[string key]
        // {
        //     get => tests.First(i => i.id.ToLower() == key.ToLower());
        // }
    }
}