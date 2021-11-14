using System;
using System.IO;
using System.Linq;
using Cc.Net.Exceptions;
using CC.Net.Extensions;
using Cc.Net.Services.Yaml;
using YamlDotNet.Core;

namespace CC.Net.Utils
{
    public static class YamlRead
    {

        public static readonly YamlDotNet.Serialization.IDeserializer Deserializer
             = new YamlDotNet.Serialization.DeserializerBuilder()
                .IgnoreUnmatchedProperties()
                .WithTypeConverter(new YamlUnittestSpecTConverter())
                .WithTypeConverter(new YamlEnumConverter())
                .WithTypeConverter(new YamlListStringConverter())
                .WithTypeConverter(new YamlDateTimeConverter())
                .Build();

        public static (T data, string content) ReadFromFile<T>(string path)
        {
            var content = File.ReadAllText(path);
            var data = ReadFromString<T>(content, path);
            return (data, content);
        }
        
        public static T ReadFromString<T>(string content, string path)
        {
            try
            {
                return Deserializer.Deserialize<T>(content);
            }
            catch(YamlException ex)
            {
                Console.Error.WriteLine($"Error while parsing {ex} {path}");
                var lines = content.SplitLines();
                var exStart = Math.Max(ex.Start?.Line - 5 ?? 0, 0);
                var highlighted = lines
                    .Skip(exStart)
                    .Take(10)
                    .Select((i, j) => $"{(exStart + j + 1):000}| {i}")
                    .Prepend("\n")
                    .Prepend(ex.Message);
                
                throw new DetailedException($"Yaml error in {path}", path, highlighted.ToArray());
            }
        }
    }
}