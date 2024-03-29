using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using CC.Net.Extensions;
using CC.Net.Utils;
using YamlDotNet.Core;
using YamlDotNet.Core.Events;
using YamlDotNet.Serialization;
using YamlDotNet.Serialization.Utilities;

namespace Cc.Net.Services.Yaml
{
    public class YamlListStringConverter : IYamlTypeConverter
    {
        private readonly IDeserializer _deserializer = new DeserializerBuilder().Build();

        public bool Accepts(Type type) => type == typeof(List<string>);

        public object ReadYaml(IParser parser, Type type)
        {
            var success = parser.TryConsume<Scalar>(out var scalar);

            if (success) {
                return new List<string> {scalar.Value};
            }

                
            
            return _deserializer.Deserialize<List<string>>(parser);
        }

        public void WriteYaml(IEmitter emitter, object? value, Type type)
        {
            throw new NotImplementedException();
        }
    }
}