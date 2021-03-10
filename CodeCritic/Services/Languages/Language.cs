using System;
using System.Collections.Generic;
using System.Linq;
using YamlDotNet.Serialization;

namespace CC.Net.Services.Languages
{
    public class Language
    {

        [YamlMember(Alias="id")]
        public string Id { get; set; }

        [YamlMember(Alias="name")]
        public string Name { get; set; }

        [YamlMember(Alias="scale-factor")]
        public double ScaleFactor { get; set; }

        [YamlMember(Alias="scale-start")]
        public double ScaleStart { get; set; }

        [YamlMember(Alias="version")]
        public string Version { get; set; }

        [YamlMember(Alias="extension")]
        public string Extension { get; set; }

        [YamlMember(Alias="disabled")]
        public bool Disabled { get; set; }

        [YamlMember(Alias="compile")]
        public List<string> Compile { get; set; } = new List<string>();

        [YamlMember(Alias="run")]
        public List<string> Run { get; set; } = new List<string>();

        [YamlMember(Alias="unittest")]
        public List<string> Unittest { get; set; } = new List<string>();

        override public String ToString()
        {
            return $"<{Id}({Name})>";
        }

        public bool CompilationNeeded => Compile.Any();
        
        public string ScaleInfo => $"{ScaleStart:0.00} + {ScaleFactor:0.00}×";

        public double ScalledTimeout(double timeout) =>
            ScaleStart + ScaleFactor * timeout;
    }
}