using System.Collections.Generic;
using DiffPlex.DiffBuilder.Model;

namespace CC.Net.Dto
{
    public class DiffResult {
        public string filename { get; set; }
        public List<DiffPiece> lines  { get; set; }
    }
}