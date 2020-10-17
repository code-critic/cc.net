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
                .Where(s => !string.IsNullOrEmpty(s))
                .ToList();

            var doc = string.Join(",\n", result);
            Console.WriteLine(doc);
            return BsonDocument.Parse($"{{{doc}}}");
        }

        public static string Parse(TableRequestFilter filter, params ParseUtilType[] extras)
        {
            var filterId = filter.id.ToLower();
            if (filter.value == "all" || filter.value == "")
            {
                return null;
            }

            if (filter.id == "course")
            {
                return $"course: \"{filter.value}\"";
            }

            if (filter.id == "courseName")
            {
                return $"courseName: \"{filter.value}\"";
            }

            if (filter.id == "courseYear")
            {
                return $"courseYear: \"{filter.value}\"";
            }

            if (filter.id == "action")
            {
                return $"action: \"{filter.value}\"";
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

            if (filterId == nameof(CcData.Language).ToLower())
            {
                return $"language: \"{filter.value}\"";
            }
            
            if (filterId == nameof(CcData.Points).ToLower())
            {
                return $"points: {filter.value}";
            }

            if (filterId == nameof(CcData.ReviewRequest).ToLower())
            {
                if (filter.value == "yes")
                {
                    return $"reviewRequest: {{ $ne: null }}";
                }
                else if (filter.value == "no")
                {
                    return $"reviewRequest: {{ $eq: null }}";
                }
            }
            
            if (filterId == nameof(CcData.Comments).ToLower())
            {
                if (filter.value == "yes")
                {
                    return $"comments: {{ $ne: [] }}";
                }
                else if (filter.value == "no")
                {
                    return $"comments: {{ $eq: [] }}";
                }
                else if (filter.value == "1")
                {
                    return $"comments: {{ $size: 1 }}";
                }
                else if (filter.value == "2")
                {
                    return $"comments: {{ $size: 2 }}";
                }
            }

            var result_status = "result.status";
            if (filter.id == result_status && filter.value != "all")
            {
                return $"\"result.status\": {int.Parse(filter.value)}";
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