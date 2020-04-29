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

        public IEnumerable<CourseProblemCase> Enumerate()
        {
            if(random > 0)
            {
                for(var i = 0; i < random; i++)
                {
                    yield return new CourseProblemCase
                    {
                        id = $"{id}.{i + 0}",
                        size = size,
                        timeout = timeout,
                    };
                }
            }
            else
            {
                yield return this;
            }
        }
    }
}