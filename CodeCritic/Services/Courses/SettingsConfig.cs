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

        public List<User> AllStudents => Teachers
            .SelectMany(i => i.Students)
            .GroupBy(i => i.id)
            .Select(i => i.First())
            .ToList();

        public List<User> StudentsFor(string teacher) => Teachers
            .Where(i => i.Id == teacher)
            .SelectMany(i => StudentWithInheritedTags(i))
            .Distinct()
            .ToList();
        
        private IEnumerable<User> StudentWithInheritedTags(SettingsConfigTeacher config)
        {
            var result = config.Students
                .Select(i => new User { id = i.id, Tags = i.Tags.Concat(config.Tags).ToList() });
            return result;
        }

        public List<SettingsConfigTeacher> TeachersFor(string student) => Teachers
            .Where(i => i.Students.Any(j => j.id == student))
            .ToList();

        [JsonIgnore]
        public string Yaml { get; set; }
    }

    public class SettingsConfigTeacher
    {
        [YamlMember(Alias = "id")]
        public string Id { get; set; }

        [YamlMember(Alias = "tags")]
        public List<string> Tags { get; set; } = new List<string>();


        [YamlMember(Alias = "students")]
        public List<User> Students { get; set; } = new List<User>();


        [YamlMember(Alias = "problems")]
        public List<string> Problems { get; set; } = new List<string>();
    }
}