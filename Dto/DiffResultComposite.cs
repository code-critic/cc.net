using System.Collections.Generic;
using System.Linq;
using DiffPlex.DiffBuilder.Model;

namespace CC.Net.Dto
{
    public class DiffResultComposite
    {
        public string Reference { get; set; }
        public string Generated { get; set; }
        public List<DiffResultLine> Lines { get; set; } = new List<DiffResultLine>();

        public string Error { get; set; }

        public bool isOk => string.IsNullOrEmpty(Error) && Lines.All(i => i.Type == DiffResultLineType.Correct);
    }

    public class DiffResultLine
    {
        public string Reference { get; set; }
        public string Generated { get; set; }

        public DiffResultLineType Type { get; set; }
    }

    public enum DiffResultLineType
    {
        Correct = 1,
        Wrong = 2,
    }
}