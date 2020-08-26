using System.IO;

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
    }
}