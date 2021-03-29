using System.Collections.Generic;
using Cc.Net.Dto;

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

        
        public string FilterProperty(string @as = null) {
            return desc ? $"\"{@as ?? id}\": -1" : $"\"{@as ??id}\": 1";
        }
        public string FilterResultProperty(string @as = null) {
            return desc ? $"\"result.{@as ?? id}\": -1" : $"\"result.{@as ??id}\": 1";
        }
    }

    public class TableRequestFilter
    {
        public string id { get; set; }
        public string value { get; set; }

        public string FilterStringProperty(string @as = null) {
            return $"\"{(@as ?? id)}\": \"{value}\"";
        }
        public string FilterRegexProperty(string @as = null) {
            return $"\"{(@as ?? id)}\": /{value}/i";
        }
        
        public string FilterNumericProperty(string @as = null) {
            return $"\"{(@as ?? id)}\": {value}";
        }
    }

    public class TableResponse
    {
        public long count { get; set; }
        public IEnumerable<CcDataDto> data { get; set; }
    }
}