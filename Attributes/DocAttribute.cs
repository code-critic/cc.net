using System;
using System.Collections.Generic;
using System.Linq;

namespace CC.Net.Attributes
{
    public class DocAttribute: Attribute
    {
        public string Description { get; }
        public List<string> Examples { get; }

        public DocAttribute(string description = "", params string[] examples)
        {
            Description = description;
            Examples = examples.ToList();
        }
    }
}