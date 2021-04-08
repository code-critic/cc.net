using System;
using System.Collections.Generic;
using MongoDB.Bson;

namespace Cc.Net.Dto
{
    public class CcDataLight {

        public ObjectId Id { get; set; }
        public string ObjectId { get; set; }
        public int Status { get; set; }
        public int Attempt { get; set; }
        public DateTime? ReviewRequest { get; set; }
        public float Points { get; set; }
        public string User { get; set; }
        public List<string> GroupUsers { get; set; }
    }
}