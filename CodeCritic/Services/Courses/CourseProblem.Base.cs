using System;
using System.Collections.Generic;
using System.Linq;
using CC.Net.Attributes;
using Cc.Net.Services.Yaml;
using YamlDotNet.Serialization;

namespace CC.Net.Services.Courses
{
    public enum ProblemType
    {
        LineByLine = 1,
        Unittest = 2,
        Program = 3,
    }
    public partial class CourseProblem
    {
        
        // PROBLEM TYPE -----------------------------------------------------------------
        
        [Doc("true/false if this problem should be treated as unittest type")]
        [Obsolete("Use `type: unittest` instead")]
        [YamlMember(Alias = "unittest")]
        public bool _unittest { get; set; }
        
        [Doc("problem type, this affects how are solutions executed and graded, default value is `linebyline`" )]
        [YamlMember(Alias = "type")]
        public ProblemType _type { get; set; } = ProblemType.LineByLine;
        public ProblemType Type => _unittest ? ProblemType.Unittest : _type;
        public bool Unittest => Type == ProblemType.Unittest; 

        // REQUIRED FILE ----------------------------------------------------------------
        
        [Obsolete("Use `files: <filename-here>` instead")]
        [Doc("A default name of the library, which will be required by cc")]
        [YamlMember(Alias = "libname")]
        public string _libname { get; set; }
        
        [Doc("string or list of string of filenames, which will be required for each solution. <br>" +
             "You can specify extension (such as `files: trial_1_lib.m` or placeholder which works with every language: <br>" +
             "`files: trial_1_lib.{extension}`")]
        [YamlMember(Alias = "files")]
        public List<string> _files { get; set; } =  new List<string>();
        public List<string> Files => string.IsNullOrEmpty(_libname)
            ? _files
            : new List<string> {_libname};

        // ------------------------------------------------------------------------------

        [Doc("Unique identifier which **cannot be later changed**. It must be filesystem and URI safe",
            "`id: foo-bar`",
            "`id: 01-hello-world`")]
        [YamlMember(Alias = "id")]
        public string Id { get; set; }

        [Doc("Human readable name, which will be visible on cc website", 
            "`name: 01-hello-world`",
            "`name: Hello World`")]
        [YamlMember(Alias = "name")]
        public string Name { get; set; }

        [Doc("*Will be used in the future* - list of categories")]
        [YamlMember(Alias = "cat")]
        public List<string> Cat { get; set; } = new List<string>();

        [Doc("Timeout in seconds (raw time, which will be scaled and translated by language used)")]
        [YamlMember(Alias = "timeout")]
        public double Timeout { get; set; }

        
        [Doc("A datetime after which you can hand over a solution (format `YYYY-MM-DD hh:mm:ss`)")]
        [YamlMember(Alias = "since")]
        public DateTime Since { get; set; } = DateTime.MinValue;
        
        [Doc("A datetime marking a soft deadline a datetime up until problem is open" +
             " and accepting solutions (format `YYYY-MM-DD hh:mm:ss` or `N days` relative to `since`)",
            "`avail: 2021-03-02 08:45:00`",
            "`avail: 7 days`")]
        [YamlMember(Alias = "avail")]
        public DateTimeOrDays _avail { get; set; }

        public DateTime Avail => _avail?.ToDateTime(Since) ?? DateTime.MaxValue;

        [Doc("A datetime marking a hard deadline after which no solution can be " +
             "sent (format `YYYY-MM-DD hh:mm:ss` or `N days` relative to `since`)",
            "`deadline: 2021-03-02 08:45:00`",
            "`deadline: 7 days`")]
        [YamlMember(Alias = "deadline")]
        public DateTimeOrDays _deadline { get; set; }
        public DateTime Deadline => _deadline?.ToDateTime(Since) ?? DateTime.MaxValue;

        
        
        [Doc("string or list of strings of filenames, which will be available in a working" +
             "directory when solution is executed")]
        [YamlMember(Alias = "assets")]
        public List<string> Assets { get; set; } = new List<string>();

        
        [Doc("string or list of strings of filenames, which will be copied out after the execution, " +
             "these may be graphs, or other student generated results")]
        [YamlMember(Alias = "export")]
        public List<string> Export { get; set; } = new List<string>();

        [Doc("A field configuring reference solution used for verifying solutions an/or generating input and outputs")]
        [YamlMember(Alias = "reference")]
        public CourseReference Reference { get; set; }

        [Doc("List of tests, which will be used for each solution")]
        [YamlMember(Alias = "tests")]
        public List<CourseProblemCase> Tests { get; set; } = new List<CourseProblemCase>();

        [Doc("A collaboration field, which can enabled team work")]
        [YamlMember(Alias = "collaboration")]
        public CourseProblemCollaborationConfig Collaboration { get; set; }
    }
}