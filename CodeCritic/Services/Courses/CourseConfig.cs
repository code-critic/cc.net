using System.Collections.Generic;
using CC.Net.Entities;
using YamlDotNet.Serialization;

namespace CC.Net.Services.Courses
{
    public class CourseConfig
    {

        [YamlMember(Alias = "name")]
        public string Name { get; set; }

        [YamlMember(Alias = "desc")]
        public string Desc { get; set; }

        [YamlMember(Alias = "disabled")]
        public bool Disabled { get; set; }

        [YamlMember(Alias = "access")]
        public string Access { get; set; }

        [YamlMember(Alias = "teachers")]
        public List<User> Teachers { get; set; } = new List<User>();

        [YamlMember(Alias = "students")]
        public List<User> Students { get; set; } = new List<User>();

        [YamlMember(Alias = "tags")]
        public List<CourseTag> Tags { get; set; }

    }
}