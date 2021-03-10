using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using CC.Net.Attributes;
using CC.Net.Collections;
using CC.Net.Db;
using CC.Net.Extensions;
using CC.Net.Services;
using CC.Net.Services.Courses;
using CC.Net.Services.Languages;
using CC.Net.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using MongoDB.Bson;
using MongoDB.Driver;
using Newtonsoft.Json;

namespace CC.Net.Controllers
{
    public partial class StudentController
    {
        public CcData ConvertToExtended(CcData item)
        {
            return _utilService.ConvertToExtended(item);
        }

        [HttpGet]
        [Route("student-result-list/{courseName}/{courseYear}/{problem}/{user}")]
        public IEnumerable<CcData> StudentResultDetail(string courseName, string courseYear, string problem, string user)
        {
            var results = _dbService.Data
                .Find(i => i.CourseName == courseName
                     && i.CourseYear == courseYear
                     && i.Problem == problem
                     && (i.User == user || i.GroupUsers.Contains(user))
                     //  && i.Action == "solve"
                     )
                .SortByDescending(i => i.Id)
                .Limit(25)
                .ToEnumerable();

            foreach (var item in results)
            {
                yield return ConvertToExtended(item);
            }
        }

        [HttpGet]
        [Route("student-result-list/{id}")]
        public CcData ResultDetail(string id)
        {
            var objectId = new ObjectId(id);
            var result = _dbService.Data
                .Find(i => i.Id == objectId)
                .First();

            return ConvertToExtended(result);
        }

        [HttpPost]
        [Route("student-result-list")]
        [RequireRole(AppUserRoles.Root)]
        public TableResponse Post([FromBody] TableRequest request)
        {
            var options = new FindOptions<CcData>();
            options.Limit = request.pageSize;
            options.Skip = request.page * request.pageSize;

            var filtered = new List<TableRequestFilter>(request.filtered);
            filtered.Add(new TableRequestFilter()
            {
                id = "action",
                value = "solve",
            });


            var matchBody = QueryUtils.Parse(
                filtered.ToArray(),
                new ParseUtilType
                {
                    Id = nameof(CcData.Attempt).ToLower(),
                    Parser = f => null,
                }
            );
            var match = new BsonDocument("$match", matchBody);

            var sort = new BsonDocument("$sort", QueryUtils.Parse(
                request.sorted.Length == 0
                ? new TableRequestSort[] { new TableRequestSort() { id = "id.timestamp", desc = true } }
                : request.sorted
            ));

            var project = new BsonDocument("$project", BsonDocument.Parse(@"
                {
                    solution: 0,
                    results: 0,
                }
            "));

            var pipeline = new List<BsonDocument>() { project, match };

            var attempt = filtered.FirstOrDefault(i => i.id == nameof(CcData.Attempt).ToLower() && i.value != "all");
            if (attempt != null)
            {
                pipeline.Add(new BsonDocument("$sort",
                    BsonDocument.Parse(@"{""result.score"": -1}"))
                );
                pipeline.Add(new BsonDocument("$group",
                    BsonDocument.Parse(@"
                        {
                            ""_id"": ""$user"",
                            ""results"": {""$push"": ""$$ROOT""}
                        }")
                    )
                );
                pipeline.Add(new BsonDocument("$unwind", BsonDocument.Parse(@"
                        {
                            ""path"": ""$results"",
                            ""includeArrayIndex"": ""grp""
                        }")
                    )
                );
                pipeline.Add(new BsonDocument("$match",
                    new BsonDocument("grp",
                        new BsonDocument("$lt", int.Parse(attempt.value)))
                    )
                );
                pipeline.Add(new BsonDocument("$replaceRoot",
                    BsonDocument.Parse(@"{""newRoot"": ""$results""}")
                    )
                );
            }

            pipeline.Add(sort);
            pipeline.Add(new BsonDocument("$skip", request.page * request.pageSize));
            pipeline.Add(new BsonDocument("$limit", request.pageSize));

            if (attempt != null)
            {
                Console.WriteLine(pipeline.ToJson());
                var data = _dbService.Data.Aggregate<CcData>(pipeline.ToArray()).ToEnumerable();
                return new TableResponse
                {
                    count = _dbService.Data.Find(matchBody).CountDocuments(),
                    data = data,
                };
            }
            else
            {
                var data = _dbService.Data.Aggregate<CcData>(pipeline.ToArray()).ToEnumerable();
                return new TableResponse
                {
                    count = _dbService.Data.Find(matchBody).CountDocuments(),
                    data = data,
                };
            }
        }
    }
}
