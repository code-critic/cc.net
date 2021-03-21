using System.Collections.Generic;
using TypeLite;

namespace Cc.Net.Apis
{
    [TsClass]
    public class ApiError
    {
        public string Name { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
    }
}