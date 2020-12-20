using System;
using System.IO;

namespace CC.Net.Utils
{
    public static class YamlRead
    {
        public static T ReadFromFile<T>(string path)
        {
            var content = File.ReadAllText(path);
            var deserializer = new YamlDotNet.Serialization.DeserializerBuilder()
                .IgnoreUnmatchedProperties()
                .Build();

            try
            {
                return deserializer.Deserialize<T>(content);
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