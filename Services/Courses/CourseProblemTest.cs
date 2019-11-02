using System.Collections.Generic;
using CC.Net.Entities;

namespace CC.Net.Services.Courses
{
    public class CourseProblemCase
    {
        public string id { get; set; }
        public int size { get; set; }
        public int random { get; set; }
        public double timeout { get; set; }
    }
}