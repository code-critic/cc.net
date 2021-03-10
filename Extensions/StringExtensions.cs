using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;

namespace CC.Net.Extensions
{
    public static class StringExtensions
    {
        public static string ReadAllText(this string path)
        {
            if (!File.Exists(path))
            {
                return null;
            }
            return File.ReadAllText(path);
        }

        public static IEnumerable<string> ReadLines(this string path)
        {
            if (File.Exists(path))
            {
                return File.ReadLines(path);
            }
            return new List<string>();
        }

        public static string[] SplitLines(this string text)
        {
            if (string.IsNullOrEmpty(text))
            {
                return new string[] { };
            }

            return text.Split(
                new[] { "\r\n", "\r", "\n" },
                StringSplitOptions.None
            );
        }

        public static string ValidFileName(this string name)
        {
            string invalidChars = Regex.Escape(new string(Path.GetInvalidFileNameChars()));
            string invalidRegStr = string.Format(@"([{0}]*\.+$)|([{0}]+)", invalidChars);

            return Regex.Replace(name, invalidRegStr, "_");
        }
        
        public static string ReverseName(this string name)
        {
            return string.Join('.', name.Split('.').Reverse());
        }

        public static string Lastname(this string name)
        {
            var pc = name.Split('.');
            return pc[pc.Length - 1];
        }
        
        public static string AsString(this IEnumerable<string> values, string separator = "\n")
        {
            return string.Join(separator, values);
        }
        
        public static string AsMarkdown(this IEnumerable<string> values, string separator = ", ", string start = "`", string end= "`")
        {
            return string.Join(separator, values.Select(i => $"{start}{i}{end}"));
        }
    }

}
