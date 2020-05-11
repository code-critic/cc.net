using System;
using System.Collections.Generic;
using CC.Net.Entities;
using YamlDotNet.Serialization;

namespace CC.Net.Services.Courses
{
    public class CourseProblemCase
    {
        [YamlMember(Alias = "id")]
        public string Id { get; set; }

        [YamlMember(Alias = "size")]
        public int Size { get; set; }

        [YamlMember(Alias = "random")]
        public int Random { get; set; }

        [YamlMember(Alias = "timeout")]
        public double Timeout { get; set; }

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