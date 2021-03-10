using System;
using CC.Net.Extensions;
using YamlDotNet.Core;
using YamlDotNet.Core.Events;
using YamlDotNet.Serialization;

namespace cc.net.Services.Yaml
{
    public class YamlDateTimeConverter : IYamlTypeConverter
    {
        public bool Accepts(Type type) => type == typeof(DateTimeOrDays);

        public object ReadYaml(IParser parser, Type type)
        {
            var parsedValue = parser.Consume<Scalar>().Value;
            return new DateTimeOrDays(parsedValue);
        }

        public void WriteYaml(IEmitter emitter, object? value, Type type)
        {
            throw new NotImplementedException();
        }
    }
}