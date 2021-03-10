using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using CC.Net.Attributes;
using CC.Net.Extensions;
using YamlDotNet.Serialization;

namespace cc.net.Docs
{
    public class DocGeneration
    {
        public static string For<T>() => For(typeof (T));
        private static readonly Type ListStringType = typeof(List<string>);

        public static string For(Type type)
        {
            var doc = new StringBuilder();
            var lst = "  - ";
            var pad = "    ";
            var end = " <br>\n";

            doc.Append($"## {type.Name}{end}");
            
            var properties = type.GetProperties()
                .Where(i => i.IsDefined(typeof(YamlMemberAttribute)) && i.IsDefined(typeof(DocAttribute)))
                .OrderBy(i => i.IsDefined(typeof(ObsoleteAttribute)))
                .ToList();
            
            properties.ForEach(p =>
            {
                var yamlAttr = (YamlMemberAttribute) p.GetCustomAttributes(typeof(YamlMemberAttribute)).First();
                var docAttr = (DocAttribute) p.GetCustomAttributes(typeof(DocAttribute)).First();
                var obsAttr = (ObsoleteAttribute) p.GetCustomAttributes(typeof(ObsoleteAttribute)).FirstOrDefault();
                var attrName = obsAttr == null ? $"`{yamlAttr.Alias}`" : $"~~`{yamlAttr.Alias}`~~";
                var attrType = TypeToString(p);

                doc.Append($"{lst}{attrName}{end}");
                if (obsAttr != null)
                {
                    doc.Append($"{pad} - **[OBSOLETE]** {obsAttr.Message}{end}");
                }

                doc.Append($"{pad} - {docAttr.Description}{end}");
                doc.Append($"{pad} - type: {attrType}{end}");
                if (docAttr.Examples.Any())
                {
                    doc.Append($"{pad} - examples: {end}");
                    docAttr.Examples.ToList().ForEach(i =>
                    {
                        doc.Append($"{pad}    - {i}{end}");
                    });
                }
            });

            return doc.ToString();
        }

        private static string TypeToString(PropertyInfo p)
        {
            switch (p.PropertyType)
            {
                case var t when t == typeof(List<string>):
                    return "`string`/`string[]`";
                case var t when t == typeof(string):
                    return "`string`";
                case var t when t == typeof(float) || t == typeof(double) || t == typeof(decimal):
                    return "`float`";
                case var t when t == typeof(bool):
                    return "`boolean`";
                case var t when t.IsEnum:
                    return $"enum [{Enum.GetNames(p.PropertyType).AsMarkdown()}]";
                case var ls when ls.GetInterfaces().Contains(typeof(IList)):
                    var subtype = ls.GetGenericArguments().FirstOrDefault();
                    return $"`{TypeToString(subtype)}[]`";
            }
            var attrType = p.PropertyType.ToString().Split('.').Last();
            return attrType;
        }
        
        private static string TypeToString(Type p)
        {
            switch (p)
            {
                case var t when t == typeof(string):
                    return "string";
                case var t when t == typeof(float) || t == typeof(double) || t == typeof(decimal):
                    return "decimal";
                case var t when t == typeof(bool):
                    return "boolean";
                case var t when t.IsEnum:
                    return Enum.GetNames(p).AsMarkdown();
                case var ls when ls.GetInterfaces().Contains(typeof(IList)):
                    var subtype = ls.GetGenericArguments().FirstOrDefault()?.GetType();
                    return $"{TypeToString(subtype)}[]";
                    
            }
            var attrType = p.ToString().Split('.').Last();
            return attrType;
        }
    }
}