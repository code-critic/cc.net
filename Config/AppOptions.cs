

using System.Collections.Generic;
using System.IO;

namespace CC.Net.Config
{

    public class AppOptions
    {
        public string CourseDir { get; set; }
        public string ConfigDir { get; set; }
        public string RootDir => new DirectoryInfo(CourseDir).Parent.ToString();

        public string AESKey { get; set; }
        public string LoginUrl { get; set; }
        public IList<string> Admins { get; set; } = new List<string>();

    }
}