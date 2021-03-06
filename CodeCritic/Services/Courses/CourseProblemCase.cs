using System;
using System.Collections.Generic;
using CC.Net.Attributes;
using CC.Net.Entities;
using YamlDotNet.Serialization;

namespace CC.Net.Services.Courses
{
    public class CourseProblemCase
    {
        [Doc("Unique filesystem and URI safe identifier and also a name for the input and output file. " +
             "Extension `.s` means input will not be generated and also keeps the file in the repository.",
            "`id: 01-COLLAB-TEST`")]
        [YamlMember(Alias = "id")]
        public string Id { get; set; }

        [Doc("Size parameter, which will be passed to the reference script when generating input", 
            "`id: foo`",
            "`size: 123`",
            "reference solution will be called with `python3 main.py -p 123`")]
        [YamlMember(Alias = "size")]
        public int Size { get; set; }

        [Doc("A number of random tests which will be generated")]
        [YamlMember(Alias = "random")]
        public int Random { get; set; }

        [Doc("Timeout in seconds")]
        [YamlMember(Alias = "timeout")]
        public double Timeout { get; set; } = 5;

        
        [YamlMember(Alias = "test")]
        public string Test { get; set; }


        private readonly CourseProblemCase _parent;

        public CourseProblemCase(CourseProblemCase parent)
        {
            _parent = parent;
        }

        public CourseProblemCase()
        { }

        public IEnumerable<CourseProblemCase> Enumerate()
        {
            if (Random > 0)
            {
                for (var i = 0; i < Random; i++)
                {
                    yield return new CourseProblemCase(this)
                    {
                        Id = $"{Id}.{i + 0}",
                        Size = Size,
                        Timeout = Timeout,
                        Random = i + 1,
                        Test = Test
                    };
                }
            }
            else
            {
                yield return this;
            }
        }

        public bool IsGeneretable()
        {
            return _parent != null || Random > 0 || Size > 0;
        }

        public string GetArguments()
        {
            var args = "";
            if (Size > 0)
            {
                args = $"{args} -p {Size}";
            }
            if (Random > 0)
            {
                args = $"{args} -r {Random}";
            }
            return args;
        }
    }
}