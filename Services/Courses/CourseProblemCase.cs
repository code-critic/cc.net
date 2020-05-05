using System;
using System.Collections.Generic;
using CC.Net.Entities;

namespace CC.Net.Services.Courses
{
    public class CourseProblemCase
    {
        public string id { get; set; }
        public int size { get; set; }
        public int random { get; set; }
        public double timeout { get; set; }

        private readonly CourseProblemCase _parent;

        public CourseProblemCase(CourseProblemCase parent)
        {
            _parent = parent;
        }

        public CourseProblemCase()
        { }

        public IEnumerable<CourseProblemCase> Enumerate()
        {
            if (random > 0)
            {
                for (var i = 0; i < random; i++)
                {
                    yield return new CourseProblemCase(this)
                    {
                        id = $"{id}.{i + 0}",
                        size = size,
                        timeout = timeout,
                        random = i + 1
                    };
                }
            }
            else
            {
                yield return this;
            }
        }

        public bool IsGeneretable() {
            return _parent != null || random > 0 || size > 0;
        }

        public string GetArguments() {
            var args = "";
            if(size > 0) {
                args = $"{args} -p {size}";
            }
            if(random > 0) {
                args = $"{args} -r {random}";
            }
            return args;
        }
    }
}