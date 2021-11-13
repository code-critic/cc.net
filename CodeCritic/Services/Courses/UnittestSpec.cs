using CC.Net.Attributes;
using YamlDotNet.Serialization;

namespace CC.Net.Services.Courses
{
    public class UnittestSpec
    {
        [Doc("Filename which will be used as reference solution",
            "`entrypoint: main.py`",
            "`entrypoint: Foo.java`")]
        [YamlMember(Alias = "entrypoint")]
        public string Entrypoint { get; set; }
        
        [Doc("Filename which will be used as reference solution",
            "`libname: main.py`",
            "`libname: Foo.java`")]
        [YamlMember(Alias = "libname")]
        public string Libname { get; set; }


        [Doc("Language identifier one of [`PY-367`, `C`, `CPP`, `JAVA`, `CS`, `MATLAB`]")]
        [YamlMember(Alias = "lang")]
        public string Lang { get; set; }


        [Doc("If true, entrypoint source code will be hidden from students")]
        [YamlMember(Alias = "hidden")]
        public bool Hidden { get; set; } = true;
    }
}
