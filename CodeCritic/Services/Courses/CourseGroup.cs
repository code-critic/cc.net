using System.Collections.Generic;
using CC.Net.Attributes;
using YamlDotNet.Serialization;

namespace CC.Net.Services.Courses
{
    public class CourseGroup
    {
        [Doc("Group problems")]
        [YamlMember(Alias = "groups")]
        public List<GroupBy> Groups = new List<GroupBy>();
    }
    
    public class GroupBy
    {
        [Doc("Group id by which problems can be grouped")]
        [YamlMember(Alias = "id")]
        public string Id { get; set; }
        
        [YamlMember(Alias = "name")]
        public string Name { get; set; }

        [YamlMember(Alias = "problems")]
        public List<string> Problems { get; set; } = new List<string>();
        
        [YamlMember(Alias = "condition")]
        public GroupCondition Condition { get; set; } = GroupCondition.One;
    }

    public enum GroupCondition
    {
       One = 1,
       All = 2,
    }
}