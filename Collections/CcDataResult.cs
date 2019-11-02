using System;
using System.Collections.Generic;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using TypeLite;

namespace CC.Net.Collections
{
    [BsonIgnoreExtraElements]
    public class CcDataResult
    {
        public string id { get; set; }
        public string status { get; set; }
        public double duration { get; set; }

        public int? returncode { get; set; }
        public string message { get; set; }
        public int? score { get; set; }
        public int?[] scores { get; set; }
        public string cmd { get; set; }
        public string uuid { get; set; }
        public string[] console { get; set; }
        public string[] message_details { get; set; }
        // public string[] attachments { get; set; }
    }
}
