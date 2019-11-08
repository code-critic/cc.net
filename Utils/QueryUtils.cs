using System;
using System.Linq;
using CC.Net.Collections;
using MongoDB.Bson;

namespace CC.Net.Utils
{
    public class ParseUtilType
    {
        public string Id { get; set; }
        public Func<TableRequestFilter, string> Parser { get; set; }
    }

    public static class QueryUtils
    {
        public static BsonDocument Parse(TableRequestFilter[] filters, params ParseUtilType[] extras)
        {
            if (filters.Length == 0)
            {
                return new BsonDocument();
            }

            var result = filters.ToList()
                .Select(f => Parse(f, extras))
                .Where(s => !string.IsNullOrEmpty(s));

            var doc = string.Join(",\n", result);
            Console.WriteLine(doc);
            return BsonDocument.Parse($"{{{doc}}}");
        }

        public static string Parse(TableRequestFilter filter, params ParseUtilType[] extras)
        {
            if (filter.value == "all" || filter.value == "")
            {
                return null;
            }

            var extra = extras.FirstOrDefault(i => i.Id == filter.id);
            if (extra != null)
            {
                return extra.Parser(filter);
            }

            if (filter.id == "id.timestamp")
            {
                var minId = new ObjectId(int.Parse(filter.value), 0, 0, 0);
                return $"_id: {{\"$gt\": ObjectId(\"{minId}\")}}";
            }

            if (filter.id == nameof(CcData.lang))
            {
                return $"{nameof(CcData.lang)}: \"{filter.value}\"";
            }

            if (filter.id == nameof(CcData.review_request))
            {
                if (filter.value == "yes")
                {
                    return $"{nameof(CcData.review_request)}: {{ $ne: null }}";
                }
                else
                {
                    return $"{nameof(CcData.review_request)}: {{ $eq: null }}";
                }
            }

            var result_status = $"{nameof(CcData.result)}.{nameof(CcData.result.status)}";
            if (filter.id == result_status && filter.value != "all")
            {
                return $"\"{result_status}\": \"{filter.value}\"";
            }

            //default fallback
            return $"\"{filter.id}\": /{filter.value}/";
        }

        public static BsonDocument Parse(TableRequestSort[] sorts)
        {
            if (sorts.Length == 0)
            {
                return new BsonDocument();
            }

            var result = sorts.ToList()
                .Select(s => Parse(s))
                .Where(s => !string.IsNullOrEmpty(s));

            var doc = string.Join(",\n", result);
            Console.WriteLine(doc);
            return BsonDocument.Parse($"{{{doc}}}");
        }


        public static string Parse(TableRequestSort sort)
        {
            if (sort.id == "id.timestamp")
            {
                return sort.desc ? "_id: -1" : "_id: 1";
            }
            
            if (sort.id == "result")
            {
                return sort.desc ? @"""result.score"": -1" : @"""result.score"": 1";
            }

            return sort.desc ? $"\"{sort.id}\": -1" : $"\"{sort.id}\": 1";
        }
    }
}