using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using TypeLite;

namespace CC.Net.Collections
{
    [BsonIgnoreExtraElements]
    public class CcDataCaseResult : CcDataResult
    {
        [BsonElement("case")]
        public string Case { get; set; }

        [BsonElement("returncode")]
        public int Returncode { get; set; }

        [BsonElement("command")]
        public string Command{ get; set; }

        [BsonElement("fullCommand")]
        public string FullCommand{ get; set; }
    }
}
