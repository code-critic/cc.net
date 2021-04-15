using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using CC.Net.Services.Courses;
using Markdig;
using Markdig.Parsers;
using Markdig.Renderers;

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

        public static string ReadAllTextOrPeek(this string path, int maxLines = 1000)
        {
            return File.Exists(path)
                ? string.Join("\n", File.ReadLines(path).Take(maxLines))
                : null;
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
                new[] {"\r\n", "\r", "\n"},
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

        public static string AsMarkdown(this IEnumerable<string> values, string separator = ", ", string start = "`",
            string end = "`")
        {
            return string.Join(separator, values.Select(i => $"{start}{i}{end}"));
        }

        public static string Dirname(this string path)
        {
            return path.Split('/').Last(i => !string.IsNullOrEmpty(i));
        }

        public static string ToAbbrev(this SubmissionStatus status)
        {
            switch (status)
            {
                case SubmissionStatus.Intime:
                    return "IN";
                case SubmissionStatus.Late:
                    return "AF";
            }

            return "??";
        }

        public static string ToMarkdown(this string content)
        {
            var pipeline = new MarkdownPipelineBuilder().Build();
            var writer = new StringWriter();
            var renderer = new HtmlRenderer(writer);

            var document = MarkdownParser.Parse(content, pipeline);
            renderer.Render(document);
            writer.Flush();

            return writer.ToString();
        }

        public static int FindMin(this string s, IEnumerable<string> opts)
        {
            var indices = opts.Select(i => s.DistanceTo(i)).ToList();
            return indices.IndexOf(indices.Min());
        }

        public static int DistanceTo(this string s, string t, bool ignoreWhiteSpace = false)
        {
            if (ignoreWhiteSpace)
            {
                s = s.Replace(" ", "").Replace("\t", "");
                t = t.Replace(" ", "").Replace("\t", "");
            }
            var n = s.Length;
            var m = t.Length;
            var d = new int[n + 1, m + 1];

            // Step 1
            if (n == 0)
            {
                return m;
            }

            if (m == 0)
            {
                return n;
            }

            // Step 2
            for (var i = 0; i <= n; d[i, 0] = i++)
            {
            }

            for (var j = 0; j <= m; d[0, j] = j++)
            {
            }

            // Step 3
            for (var i = 1; i <= n; i++)
            {
                //Step 4
                for (var j = 1; j <= m; j++)
                {
                    // Step 5
                    var cost = t[j - 1] == s[i - 1] ? 0 : 1;

                    // Step 6
                    d[i, j] = Math.Min(
                        Math.Min(d[i - 1, j] + 1, d[i, j - 1] + 1),
                        d[i - 1, j - 1] + cost);
                }
            }
            
            // Step 7
            return d[n, m];
        }
    }
}