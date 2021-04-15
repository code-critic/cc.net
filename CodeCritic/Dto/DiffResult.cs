using System.Collections.Generic;
using System.Linq;
using DiffPlex.DiffBuilder.Model;

namespace CC.Net.Dto
{
    public class DiffResult {
        public string Reference { get; set; }
        public string Generated { get; set; }
        public List<DiffPiece> Lines  { get; set; }

        public bool isOk => Lines.All(i => i.Type == ChangeType.Unchanged);
    }
    
    public class SideBySideDiff {
        public string A { get; set; }
        public string B { get; set; }
        public SideBySideDiffModel Diff { get; set; }
    }
}