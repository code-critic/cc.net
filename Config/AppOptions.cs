

using System.IO;

namespace CC.Net.Config
{

    public class AppOptions
    {
        public string CourseDir { get; set; }
        public string ConfigDir { get; set; }
        public string RootDir => new DirectoryInfo(CourseDir).Parent.ToString();
    }
}