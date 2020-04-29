using System;
using System.IO;
using System.Linq.Expressions;
using MongoDB.Bson;
using MongoDB.Driver;

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
    }

}
