using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using CC.Net.Collections;
using CC.Net.Db;
using CC.Net.Extensions;
using CC.Net.Utils;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using MongoDB.Bson;
using MongoDB.Driver;
using Newtonsoft.Json;

namespace CC.Net.Controllers
{
    [ApiController]
    [Route("api")]
    public class StudentResultListController : ControllerBase
    {

        private readonly ILogger<StudentResultListController> _logger;
        private readonly DbService _dbService;

        public StudentResultListController(ILogger<StudentResultListController> logger, DbService dbService)
        {
            _logger = logger;
            _dbService = dbService;
        }

        [HttpGet]
        [Route("student-result-list/{courseName}/{courseYear}/{problem}/{user}")]
        public IEnumerable<CcData> StudentResultDetail(string courseName, string courseYear, string problem, string user)
        {
            return _dbService.Data
                .Find(i => i.CourseName == courseName
                     && i.CourseYear == courseYear
                     && i.Problem == problem
                     && i.User == user
                     && i.Action == "solve"
                     )
                .Limit(50)
                .ToEnumerable();
        }

        [HttpGet]
        [Route("student-result-list/{id}")]
        public CcData ResultDetail(string id)
        {
            var objectId = new ObjectId(id);
            var result = _dbService.Data
                .Find(i => i.Id == objectId)
                .First();
            return result;
        }

        [HttpPost]
        [Route("student-result-list")]
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
                    Id = nameof(CcData.Attempt),
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

            var attempt = filtered.FirstOrDefault(i => i.id == nameof(CcData.Attempt) && i.value != "all");
            if (attempt != null)
            {
                pipeline.Add(new BsonDocument("$sort",
                    BsonDocument.Parse(@" {""result.score"": -1,}"))
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
