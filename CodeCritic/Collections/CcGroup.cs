using System.Collections.Generic;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace CC.Net.Collections
{

    [BsonIgnoreExtraElements]
    public class CcGroup : IObjectId
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

        [BsonIgnore]
        public string Oid { get; set; }

        [BsonIgnore]
        public bool IsLocked { get; set; }


        [BsonElement("owner")]
        public string Owner { get; set; }

        [BsonElement("name")]
        public string Name { get; set; }

        [BsonElement("status")]
        public CcUserGroupStatus Status { get; set; }

        [BsonElement("users")]
        public List<CcUserGroup> Users { get; set; } = new List<CcUserGroup>();
    }

    [BsonIgnoreExtraElements]
    public class CcUserGroup
    {
        [BsonElement("name")]
        public string Name { get; set; }

        [BsonElement("status")]
        public CcUserGroupStatus Status { get; set; }
    }

    public class CcUserGroupUpdate: CcUserGroup
    {
        public string Oid { get; set; }
    }

    public enum CcUserGroupStatus
    {
        NotConfirmed = 0,
        Confirmed = 1,
        Rejected = 2,
    }
}
