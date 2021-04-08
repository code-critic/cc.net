using System;
using CC.Net.Extensions;
using YamlDotNet.Core;
using YamlDotNet.Core.Events;
using YamlDotNet.Serialization;

namespace Cc.Net.Services.Yaml
{
    public class YamlEnumConverter : IYamlTypeConverter
    {
        public bool Accepts(Type type) => type.IsEnum;

        public object ReadYaml(IParser parser, Type type)
        {
            var parsedValue = parser.Consume<Scalar>().Value;
            if (Enum.TryParse(type, parsedValue, true, out var result))
            {
                return result;
            }

            var options = Enum.GetNames(type);
            throw new ArgumentException($"Expected one of {options.AsString(", ")} but got {parsedValue}");
        }

        public void WriteYaml(IEmitter emitter, object? value, Type type)
        {
            throw new NotImplementedException();
        }
    }
}