using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace CC.Net.Utils
{
    public static class StringUtils
    {

        public static string ReplaceCommon(this string str, string filename)
        {
            return str
                .Replace("<filename>", filename)
                .Replace("<filename-no-ext>", Path.GetFileNameWithoutExtension(filename));
        }

        public static List<string> FromAffiliation (this string affiliation)
        {
            return affiliation.Split(";")
                .Select(i => i.Split('@').First())
                .ToList();
        }

        public static string ToAffiliation (this IEnumerable<string> roles)
        {
            return string.Join(";", roles.Select(i => $"{i}@tul.cz"));
        }
    }
}