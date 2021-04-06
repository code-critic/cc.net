using System;
using System.Linq;
using CC.Net.Collections;
using CC.Net.Services.Courses;
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
        public static BsonDocument Parse(TableRequestFilter[] filters)
        {
            if (filters.Length == 0)
            {
                return new BsonDocument();
            }

            var result = filters.ToList()
                .Select(f => Parse(f))
                .Where(s => !string.IsNullOrEmpty(s))
                .ToList();

            var doc = string.Join(",\n", result);
            return BsonDocument.Parse($"{{{doc}}}");
        }


        public static string Parse(TableRequestFilter filter)
        {
            var filterId = filter.id.ToLower();
            if (filter.value == "all" || string.IsNullOrWhiteSpace(filter.value))
            {
                return null;
            }
            switch (filterId)
            {
                case "attempt":
                    // handled different in a way
                    return "";

                case "user":
                case "problem":
                    return filter.FilterRegexProperty();

                case "users":
                    return filter.FilterRegexProperty("user");

                case "action":
                case "language":
                    return filter.FilterStringProperty();

                case "course":
                    return filter.FilterRegexProperty("courseName");

                case "year":
                    return filter.FilterRegexProperty("courseYear");

                case "submissionstatus":
                case "points":
                    return filter.FilterNumericProperty();

                case "islate":
                    var value = (int)filter.value.ParseSubmissionStatus();
                    if (value == 0)
                    {
                        return "";
                    }
                    return $"submissionStatus: {value}";

                case "id.timestamp":
                case "date":
                    var minId = new ObjectId(int.Parse(filter.value), 0, 0, 0);
                    return $"_id: {{\"$gt\": ObjectId(\"{minId}\")}}";

                case "reviewrequest":
                    if (filter.value == "yes")
                    {
                        return $"reviewRequest: {{ $ne: null }}";
                    }
                    else if (filter.value == "no")
                    {
                        return $"reviewRequest: {{ $eq: null }}";
                    }
                    return null;

                case "comments":
                    if (filter.value == "yes")
                    {
                        return $"comments: {{ $ne: [] }}";
                    }
                    else if (filter.value == "no")
                    {
                        return $"comments: {{ $eq: [] }}";
                    }
                    else if (int.TryParse(filter.value, out var n))
                    {
                        return $"comments: {{ $size: {n} }}";
                    }
                    return null;

                case "status":
                    return $"\"result.status\": {int.Parse(filter.value)}";
            }

            //default fallback
            return filter.FilterRegexProperty();
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
            return BsonDocument.Parse($"{{{doc}}}");
        }


        public static string Parse(TableRequestSort sort)
        {
            switch (sort.id.ToLower())
            {
                case "id.timestamp":
                case "date":
                    return sort.FilterProperty("_id");

                case "submissionstatus":
                case "islate":
                    return sort.desc ? @"""result.submissionstatus"": -1" : @"""result.submissionstatus"": 1";

                case "duration":
                case "score":
                    return sort.FilterResultProperty();

                case "group":
                    return sort.FilterProperty("groupName");

                case "users":
                    return sort.FilterProperty("user");
            }

            return sort.FilterProperty();
        }
    }
}