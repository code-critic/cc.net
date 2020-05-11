using System.Collections.Generic;
using System.Linq;
using YamlDotNet.Serialization;

namespace CC.Net.Services.Courses
{
    public class CourseReference
    {
        [YamlMember(Alias = "name")]
        public string Name { get; set; }

        [YamlMember(Alias = "lang")]
        public string Lang { get; set; }

        // public CourseProblemTest this[string key]
        // {
        //     get => tests.First(i => i.id.ToLower() == key.ToLower());
        // }
    }
}