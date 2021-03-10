using System;
using System.IO;
using cc.net.Services.Yaml;

namespace CC.Net.Utils
{
    public static class YamlRead
    {
        public static T ReadFromFile<T>(string path)
        {
            try
            {
                var content = File.ReadAllText(path);
                return ReadFromString<T>(content);
            }
            catch(Exception ex)
            {
                Console.Error.WriteLine($"Error reading file {path}");
                throw ex;
            }
        }
        
        public static T ReadFromString<T>(string content)
        {
            var deserializer = new YamlDotNet.Serialization.DeserializerBuilder()
                .IgnoreUnmatchedProperties()
                .WithTypeConverter(new YamlEnumConverter())
                .WithTypeConverter(new YamlListStringConverter())
                .WithTypeConverter(new YamlDateTimeConverter())
                .Build();

            try
            {
                return deserializer.Deserialize<T>(content);
            }
            catch(Exception ex)
            {
                Console.Error.WriteLine($"Error while parsing {ex}");
                throw ex;
            }
        }
    }
}