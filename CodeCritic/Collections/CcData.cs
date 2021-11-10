using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.Serialization;
using CC.Net.Extensions;
using CC.Net.Services;
using CC.Net.Services.Courses;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Newtonsoft.Json;

namespace CC.Net.Collections
{
    [BsonIgnoreExtraElements]
    public class CcDataSimple : IObjectId
    {
        [BsonId]
        [BsonElement("_id")]
        public ObjectId Id { get; set; }

        [BsonElement("attempt")]
        public int Attempt { get; set; }

        [BsonElement("points")]
        public float Points { get; set; }

        [BsonElement("gradeComment")]
        public string GradeComment { get; set; }

        [BsonElement("reviewRequest")]
        public DateTime? ReviewRequest { get; set; }

        [BsonElement("user")]
        public string User { get; set; }

        [BsonElement("action")]
        public string Action { get; set; }

        [BsonElement("courseName")]
        public string CourseName { get; set; }

        [BsonElement("courseYear")]
        public string CourseYear { get; set; }

        [BsonElement("problem")]
        public string Problem { get; set; }
    }

    [BsonIgnoreExtraElements]
    public class CcData : IObjectId
    {
        [BsonId]
        [BsonElement("_id")]
        public ObjectId Id { get; set; }

        override public string ToString()
        {
            return
                $"{Id}/{Action}/{ResultDirname,-10} {CourseName}/{CourseYear}/{Problem} [{Result?.Duration:0.000} sec] {ProcessStatus.Get(Result?.Status ?? -1).Name}";
        }

        public string ToString(CcDataCaseResult result)
        {
            return
                $"{Id}/{Action}/{ResultDirname,-10} {CourseName}/{CourseYear}/{Problem}/{result.Case} [{result?.Duration:0.000} sec] {ProcessStatus.Get(result?.Status ?? -1).Name}";
        }

        public string ToString(string caseId)
        {
            return
                $"{Id}/{Action}/{ResultDirname,-10} {CourseName}/{CourseYear}/{Problem}/{caseId} [{Result?.Duration:0.000} sec] {ProcessStatus.Get(Result?.Status ?? -1).Name}";
        }

        public string ObjectId => Id.ToString();

        [BsonIgnore]
        public bool IsActive { get; set; }

        [BsonElement("user")]
        public string User { get; set; }

        [BsonElement("groupName")]
        public string GroupName { get; set; }

        [BsonElement("groupId")]
        public ObjectId GroupId { get; set; }

        [BsonElement("groupUsers")]
        public List<string> GroupUsers { get; set; } = new List<string>();

        [BsonIgnore]
        public string ResultDirname => IsGroup
            ? string.Join("", GroupUsers.Select(i => i.Lastname())).ValidFileName()
            : User.ReverseName().ValidFileName();

        [BsonIgnore]
        public bool IsGroup => !string.IsNullOrEmpty(GroupName);

        [BsonIgnore]
        public List<string> UserOrGroupUsers => IsGroup
            ? GroupUsers
            : new List<string> {User};


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

        [BsonElement("submissionStatus")]
        public SubmissionStatus SubmissionStatus { get; set; }

        public string ResultDir(string courseDir) =>
            Path.Combine(
                courseDir, CourseYear, "results", ResultDirname, Problem,
                $"{Attempt:D2}-{ProcessStatus.Get(Result.Status).Letter}-{ProcessStatus.Get(Result.Status).Name}"
            );

        [BsonElement("attempt")]
        public int Attempt { get; set; }

        [BsonElement("points")]
        public float Points { get; set; }

        [BsonElement("gradeComment")]
        public string GradeComment { get; set; }

        [BsonElement("reviewRequest")]
        public DateTime? ReviewRequest { get; set; }

        [BsonElement("comments")]
        public List<LineComment> Comments { get; set; } = new List<LineComment>();

        [BsonIgnore]
        public List<SimpleFile> Files { get; set; } = new List<SimpleFile>();

        public class SimpleFile
        {
            [JsonIgnore]
            [IgnoreDataMember]
            public string RawPath { get; set; }
            
            public string RelPath { get; set; }
            public string Filename { get; set; }
            public bool IsDir { get; set; }
            
            public object Content { get; set; }
            public List<SimpleFile> Files { get; set; } = new List<SimpleFile>();
        }

        public class LineComment
        {
            [BsonElement("text")]
            public string Text { get; set; }

            [BsonElement("time")]
            public double Time { get; set; }

            [BsonElement("user")]
            public string User { get; set; }

            [BsonElement("line")]
            public int Line { get; set; }

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

            [BsonElement("hidden")]
            public bool Hidden { get; set; }

            [BsonIgnore]
            public bool IsDynamic { get; set; } = false;

            [BsonIgnore]
            public bool IsSeparator { get; set; } = false;

            public static CcDataSolution Single(string content, string filename, int index = 0, bool isMain = true,
                bool hidden = false)
            {
                return new CcDataSolution
                {
                    Filename = filename,
                    Content = content,
                    Index = index,
                    IsMain = isMain,
                    IsDynamic = false,
                    Hidden = hidden,
                };
            }

            public static CcDataSolution Seperator(string title)
            {
                return new CcDataSolution
                {
                    IsSeparator = true,
                    Filename = title,
                };
            }

            public static CcDataSolution Dynamic(string filename, string url, int index = 0)
            {
                return new CcDataSolution
                {
                    Filename = filename,
                    Content = url,
                    Index = index,
                    IsMain = false,
                    IsDynamic = true
                };
            }
        }
    }
}