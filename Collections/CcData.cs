using System;
using System.Collections.Generic;
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

        public CcDataResult result { get; set; }
        public List<CcDataResult> results { get; set; }
        public string uuid { get; set; }
        public string lang { get; set; }
        public string solution { get; set; }
        public string output_dir { get; set; }
        public int? attempt { get; set; }
        public float? points { get; set; }


        public DateTime? review_request { get; set; }
        // public BsonDocument review { get; set; }
        // public BsonDocument compilation { get; set; }
        // // public BsonDocument time { get; set; }
        // public BsonDocument active { get; set; }

        // [BsonExtraElements]
        // public Dictionary<string, object> Rest { get; set; }
    }
}
