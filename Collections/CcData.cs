using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Serialization;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using TypeLite;

namespace CC.Net.Collections
{
    [BsonIgnoreExtraElements]
    public class CcData
    {
        [BsonId]
        [BsonElement("_id")]
        public ObjectId Id { get; set; }

        override public string ToString()
        {
            return $"CC({CourseName}/{CourseYear}/{Problem} {User} written {Language}, action {Action})";
        }

        public string ObjectId
        {
            get
            {
                return Id.ToString();
            }
        }

        [BsonElement("user")]
        public string User { get; set; }

        [BsonElement("courseName")]
        public string CourseName { get; set; }

        [BsonElement("courseYear")]
        public string CourseYear { get; set; }

        [BsonElement("problem")]
        public string Problem { get; set; }

        [BsonElement("action")]
        public string Action { get; set; }

        [BsonElement("docker")]
        public bool Docker { get; set; }

        [BsonElement("result")]
        public CcDataResult Result { get; set; }

        [BsonElement("results")]
        public List<CcDataCaseResult> Results { get; set; } = new List<CcDataCaseResult>();

        [BsonElement("language")]
        public string Language { get; set; }

        [BsonElement("solutions")]
        public List<CcDataSolution> Solutions { get; set; } = new List<CcDataSolution>();

        [BsonElement("outputDir")]
        public string OutputDir { get; set; }

        [BsonElement("attempt")]
        public int Attempt { get; set; }

        [BsonElement("points")]
        public float Points { get; set; }

        [BsonElement("reviewRequest")]
        public DateTime? ReviewRequest { get; set; }

        [BsonElement("comments")]
        public List<LineComment> Comments { get; set; } = new List<LineComment>();

        public class LineComment
        {
            [BsonElement("text")]
            public string Text { get; set; }

            [BsonElement("time")]
            public double Time { get; set; }

            [BsonElement("user")]
            public string User { get; set; }

            [BsonElement("line")]
            public object Line { get; set; }

            [BsonElement("filename")]
            public string Filename { get; set; }
        }

        public class CcDataSolution
        {
            [BsonElement("filename")]
            public string Filename { get; set; }

            [BsonElement("content")]
            public string Content { get; set; }

            [BsonElement("index")]
            public int Index { get; set; }

            [BsonElement("isMain")]
            public bool IsMain { get; set; }

            public static CcDataSolution Single(string content, string filename, int index = 0, bool isMain = true)
            {
                return new CcDataSolution
                {
                    Filename = filename,
                    Content = content,
                    Index = index,
                    IsMain = isMain
                };
            }
        }
    }
}
