using System;
using System.Collections.Generic;
using System.Linq;

namespace CC.Net.Services.Languages
{
    public class Language
    {
        public string id { get; set; }
        public string name { get; set; }
        public double scale { get; set; }
        public string image { get; set; }
        public string version { get; set; }
        public string extension { get; set; }
        public string style { get; set; }
        public List<string> compile { get; set; }
        public List<string> run { get; set; }
        public bool disabled { get; set; }

        override public String ToString()
        {
            return $"<{id}({name})>";
        }

        public bool CompilationNeeded => compile != null && compile.Any();
    }
}