using System;
using System.Linq;
using CC.Net.Collections;
using MongoDB.Bson;

namespace CC.Net.Utils
{
    public static class QueryUtils
    {
        public static BsonDocument Parse(TableRequestFilter[] filters) {
            if(filters.Length == 0) {
                return new BsonDocument();
            }

            var result = filters.ToList()
                .Select(f => Parse(f))
                .Where(s => !string.IsNullOrEmpty(s));

            var doc = string.Join(",\n", result);
            Console.WriteLine(doc);
            return BsonDocument.Parse($"{{{doc}}}");
        }

        public static BsonDocument Parse(TableRequestSort[] sorts) {
            if(sorts.Length == 0) {
                return new BsonDocument();
            }

            var result = sorts.ToList()
                .Select(s => Parse(s))
                .Where(s => !string.IsNullOrEmpty(s));

            var doc = string.Join(",\n", result);
            Console.WriteLine(doc);
            return BsonDocument.Parse($"{{{doc}}}");
        }

        public static string Parse(TableRequestSort sort) {
            if(sort.id == "id.timestamp") {
                return sort.desc ? $"_id: -1": $"_id: 1";
            }
            return sort.desc ? $"\"{sort.id}\": -1" :  $"\"{sort.id}\": 1";
        }

        public static string Parse(TableRequestFilter filter)
        {
            {
                if (filter.value == "all" || filter.value == "")
                {
                    return null;
                }

                if (filter.id == nameof(CcData.attempt))
                {
                    return $"{nameof(CcData.attempt)}: {filter.value}";
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
        }
    }
}