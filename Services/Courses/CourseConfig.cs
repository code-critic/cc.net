using System.Collections.Generic;
using CC.Net.Entities;

namespace CC.Net.Services.Courses
{
    public class CourseConfig
    {
        public string name { get; set; }
        public string desc { get; set; }
        public bool disabled { get; set; }
        public string access { get; set; }

        public List<User> teachers {get; set;}
        public List<User> students {get; set;}
        public List<CourseTag> tags {get; set;}
    }
}