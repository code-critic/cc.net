using System;
using System.Collections.Generic;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using TypeLite;

namespace CC.Net.Collections
{
    public class CcDataAggId {
        public string user { get; set; }
        public string problem { get; set; }
    }

    [BsonIgnoreExtraElements]
    public class CcDataAgg
    {
        [BsonElement("_id")]
        public CcDataAggId id { get; set; }
        public CcData result { get; set; }
    }
}