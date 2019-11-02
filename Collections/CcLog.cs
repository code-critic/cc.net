using System.Collections.Generic;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace CC.Net.Collections
{
    [BsonIgnoreExtraElements]
    public class CcLog
    {
        [BsonId]
        [BsonElement("_id")]
        public ObjectId Id { get; set; }

        public string user { get; set; }
        public string action { get; set; }
        public string course { get; set; }
        public string problem { get; set; }
        public bool docker { get; set; }
        public string language { get; set; }
        public string solution { get; set; }

        [BsonExtraElements]
        public Dictionary<string, object> Rest { get; set; }
    }
}