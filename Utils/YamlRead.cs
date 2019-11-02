using System.Collections.Generic;
using System.IO;

namespace CC.Net.Utils
{
    public static class YamlRead
    {
        public static T Read<T>(string path)
        {
            var content = File.ReadAllText(path);
            return new YamlDotNet.Serialization.Deserializer()
                .Deserialize<T>(content);
        }
    }
}