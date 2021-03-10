using System.Collections.Generic;
using System.Linq;
using CC.Net.Attributes;
using YamlDotNet.Serialization;

namespace CC.Net.Services.Courses
{
    public class CourseReference
    {
        [Doc("Filename which will be used as reference solution",
            "`name: main.py`",
            "`name: Foo.java`")]
        [YamlMember(Alias = "name")]
        public string Name { get; set; }

        [Doc("Language identifier one of [`PY-367`, `C`, `CPP`, `JAVA`, `CS`, `MATLAB`]")]
        [YamlMember(Alias = "lang")]
        public string Lang { get; set; }

        [Doc("If true, reference will file will be hidden from students")]
        [YamlMember(Alias = "hidden")]
        public bool Hidden { get; set; } = true;
    }
}