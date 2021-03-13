using System.IO;

namespace CC.Net.Utils
{
    public class FileTree
    {
        private string _root;

        public FileTree(string root)
        {
            _root = root;
        }

        override public string ToString()
        {
            return _root;
        }

        public string Root => _root;
        public string RootFile(string filename) => Path.Combine(Root, filename);
        public string CompilationFile => RootFile(CourseContext.CompilationFileName);

        public string InputDir => Path.Combine(Root, "input");
        public string OutputDir => Path.Combine(Root, "output");
        public string ErrorDir => Path.Combine(Root, "error");
        public string AssetsDir => Path.Combine(Root, "assets");
        public string ScriptsDir => Path.Combine(Root, "../../scripts");
        public string VerificationDir => Path.Combine(Root, ".verification");
        public string InputFile(string filename) => Path.Combine(InputDir, filename);
        public string OutputFile(string filename) => Path.Combine(OutputDir, filename);
        public string ErrorFile(string filename) => Path.Combine(ErrorDir, filename);
        public string AssetsFile(string filename) => Path.Combine(AssetsDir, filename);
        public string VerificationFile(string filename) => Path.Combine(VerificationDir, filename);
        
        public FileTree CaseDir(string caseId) => new FileTree(Path.Combine(Root, caseId));
        public FileTree AssetsIdDir(string filename) => new FileTree(Path.Combine(AssetsDir, filename));
    }
}