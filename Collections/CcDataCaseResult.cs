using System;
using System.Collections.Generic;
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
        [BsonElement("cmd")]
        public string Cmd { get; set; }
    }
}
