using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Serialization;
using CC.Net.Entities;
using YamlDotNet.Serialization;

namespace CC.Net.Services.Courses
{
    public class SettingsConfig
    {

        [YamlMember(Alias = "teachers")]
        public List<SettingsConfigTeacher> Teachers { get; set; } = new List<SettingsConfigTeacher>();


        public IEnumerable<User> AllStudents => Teachers
            .SelectMany(i => i.Students)
            .GroupBy(i => i.id)
            .Select(i => i.First());


        [JsonIgnore]
        public string Yaml { get; set; }
    }

    public class SettingsConfigTeacher
    {
        [YamlMember(Alias = "id")]
        public string Id { get; set; }

        [YamlMember(Alias = "tags")]
        public List<string> Tags { get; set; }


        [YamlMember(Alias = "students")]
        public List<User> Students { get; set; } = new List<User>();


        [YamlMember(Alias = "problems")]
        public List<string> Problems { get; set; } = new List<string>();
    }
}