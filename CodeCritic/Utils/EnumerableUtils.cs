using System;
using System.Collections.Generic;
using System.Linq;
using CC.Net.Extensions;

namespace Cc.Net.Utils
{
    public static class EnumerableUtils
    {
        public static List<(string First, string Second)> ZipLines(string a, string b)
        {
            return ZipLines(a.SplitLines().ToList(), b.SplitLines().ToList());
        }

        public static IEnumerable<string> Pad(List<string> a, int size)
        {
            if (a.Count < size)
            {
                var rest = new int[size - a.Count].Select(i => "");
                a.AddRange(rest);
            }
            
            return a;
        }
        
        public static List<(string First, string Second)> ZipLines(List<string> a, List<string> b)
        {
            var max = Math.Max(a.Count, b.Count);
            var x = Pad(a, max);
            var y = Pad(b, max);
            var lines = x.Zip(y);

            return lines.ToList();
        }
    }
}