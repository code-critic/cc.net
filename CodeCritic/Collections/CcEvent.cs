using System.Collections.Generic;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace CC.Net.Collections
{

    public enum CcEventType {
        Unknown = 0,
        NewComment = 1,
        NewGrade = 2,
        NewCodeReview = 3,
    }

    [BsonIgnoreExtraElements]
    public class CcEvent
    {
        [BsonId]
        [BsonElement("_id")]
        public ObjectId Id { get; set; }

        public string ObjectId
        {
            get
            {
                return Id.ToString();
            }
        }


        [BsonElement("resultId")]
        public ObjectId ResultId { get; set; }

        public string ResultObjectId
        {
            get
            {
                return ResultId == null ? null : ResultId.ToString();
            }
        }


        [BsonElement("sender")]
        public string Sender { get; set; }

        [BsonElement("reciever")]
        public string Reciever { get; set; }


        [BsonElement("subject")]
        public string Subject { get; set; }


        [BsonElement("content")]
        public string Content { get; set; }


        [BsonElement("type")]
        public CcEventType Type { get; set; }


        [BsonElement("isNew")]
        public bool IsNew { get; set; }
    }
}