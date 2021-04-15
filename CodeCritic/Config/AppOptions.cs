

using System.Collections.Generic;
using System.IO;

namespace CC.Net.Config
{

    public class AppOptions
    {
        public string CourseDir { get; set; }
        public string ConfigDir { get; set; }
        public string RootDir => new DirectoryInfo(CourseDir).Parent.ToString();

        public DockerOptions DockerOptions { get; set; }

        public string AESKey { get; set; }
        public string SysAdminPasswd { get; set; }
        public string LoginUrl { get; set; }
        public string ReturnUrl { get; set; } = null;
        public string Version { get; set; } = "develop";
        public IList<string> Admins { get; set; } = new List<string>();

    }
}