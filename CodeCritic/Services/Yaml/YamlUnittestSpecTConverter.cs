using System;
using System.Collections.Generic;
using YamlDotNet.Core;
using YamlDotNet.Core.Events;
using YamlDotNet.Serialization;
using CC.Net.Services.Courses;
using OneOf;
using CC.Net.Utils;

namespace Cc.Net.Services.Yaml
{
    public class YamlUnittestSpecTConverter : IYamlTypeConverter
    {

        public bool Accepts(Type type) => type == typeof(OneOf<bool, List<UnittestSpec>>);

        public object ReadYaml(IParser parser, Type type)
        {
            var currentAsScalar = parser.Current as Scalar;
            var currentAsSequence = parser.Current as SequenceStart;
            var currentAsMapping = parser.Current as MappingStart;

            if (currentAsScalar != null)
            {
                return bool.Parse(parser.Consume<Scalar>().Value);
            }
            else if (currentAsSequence != null)
            {
                return YamlRead.Deserializer.Deserialize<List<UnittestSpec>>(parser);
            } 
            else if (currentAsMapping != null)
            {
                return new List<UnittestSpec>() { YamlRead.Deserializer.Deserialize<UnittestSpec>(parser) };
            }

            throw new NotImplementedException();
        }

        public void WriteYaml(IEmitter emitter, object? value, Type type)
        {
            throw new NotImplementedException();
        }
    }
}