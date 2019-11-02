using System.Collections.Generic;

namespace CC.Net.Utils
{
    public class TableRequest
    {
        public int pageSize { get; set; }
        public int page { get; set; }
        public TableRequestSort[] sorted { get; set; }
        public TableRequestFilter[] filtered { get; set; }
    }

    public class TableRequestSort
    {
        public string id { get; set; }
        public bool desc { get; set; }
    }

    public class TableRequestFilter
    {
        public string id { get; set; }
        public string value { get; set; }
    }

    public class TableResponse
    {
        public long count { get; set; }
        public IEnumerable<object> data { get; set; }
    }
}