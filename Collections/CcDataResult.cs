using System;
using CC.Net.Services;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson.Serialization.Serializers;

namespace CC.Net.Collections
{

    public class BsonStatusSerializer : SerializerBase<int>
{
    public override int Deserialize(BsonDeserializationContext context, BsonDeserializationArgs args)
    {
        var type = context.Reader.GetCurrentBsonType();
        if (type == BsonType.Int32)
        {
            return context.Reader.ReadInt32();
        }
        else if (type == BsonType.String)
        {
            return (int)context.Reader.ReadDouble();
        } 
        return (int) ProcessStatusCodes.ErrorWhileRunning;
    }

    public override void Serialize(BsonSerializationContext context, BsonSerializationArgs args, int value)
    {
        base.Serialize(context, args, value);
    }
}

    [BsonIgnoreExtraElements]
    public class CcDataResult
    {
        [BsonElement("status")]
        // [BsonSerializer(typeof(BsonStatusSerializer))]
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
