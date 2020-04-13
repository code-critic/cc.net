using System.IO;

namespace CC.Net.Utils
{
    public static class YamlRead
    {
        public static T Read<T>(string path)
        {
            var content = File.ReadAllText(path);
            var deserializer = new YamlDotNet.Serialization.DeserializerBuilder()
                .IgnoreUnmatchedProperties()
                .Build();
                
            return deserializer.Deserialize<T>(content);
        }
    }
}