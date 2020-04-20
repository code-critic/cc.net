using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Serialization;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using TypeLite;

namespace CC.Net.Collections
{
    [BsonIgnoreExtraElements]
    public class CcData
    {
        [BsonId]
        [BsonElement("_id")]
        public ObjectId id { get; set; }

        public string objectId
        {
            get
            {
                return id.ToString();
            }
        }

        public string user { get; set; }
        public string course { get; set; }
        public string problem { get; set; }
        public string action { get; set; }
        public bool docker { get; set; }

        public string courseName => course.Split('-')[0];
        public string courseYear => course.Split('-')[1];

        public CcDataResult result { get; set; }
        public List<CcDataResult> results { get; set; }
        public string uuid { get; set; }
        public string lang { get; set; }
        public string solution { get; set; }
        public string output_dir { get; set; }
        public int? attempt { get; set; }
        public float? points { get; set; }


        public DateTime? review_request { get; set; }

        [JsonIgnore]
        public Dictionary<object, IEnumerable<LineComment>> review { get; set; }

        public IEnumerable<LineComment> comments
        {
            get
            {
                if (review == null || review.Count == 0)
                {
                    return new List<LineComment>();
                }

                var comments = review
                    .SelectMany(i => i.Value.Select(j => new LineComment
                    {
                        text = j.text,
                        time = j.time,
                        user = j.user,
                        line = i.Key,
                    }));

                return comments;
            }
        }

        public class LineComment
        {
            public string text { get; set; }
            public double time { get; set; }
            public string user { get; set; }
            public object line { get; set; }
        }

        // public BsonDocument compilation { get; set; }
        // // public BsonDocument time { get; set; }
        // public BsonDocument active { get; set; }

        // [BsonExtraElements]
        // public Dictionary<string, object> Rest { get; set; }
    }
}
