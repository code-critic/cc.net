using MongoDB.Bson.Serialization.Attributes;

namespace CC.Net.Collections
{
    [BsonIgnoreExtraElements]
    public class CcDataResult
    {
        [BsonElement("status")]
        public int Status { get; set; }
        [BsonElement("duration")]
        public double Duration { get; set; }
        [BsonElement("message")]
        public string Message { get; set; }
        [BsonElement("score")]
        public int Score { get; set; }
        [BsonElement("scores")]
        public int[] Scores { get; set; }
        [BsonElement("console")]
        public string[] Console { get; set; }
        [BsonElement("messages")]
        public string[] Messages { get; set; }
    }
}
