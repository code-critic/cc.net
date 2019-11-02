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
    [Route("[controller]")]
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
        public IEnumerable<CcData> Get(int limit = 10, int skip = 0, int d = 0)
        {
            var opts = new FindOptions();
            var data = _dbService.Data.Find(i => i.action == "solve", opts)
                .Project<CcData>(Builders<CcData>.Projection.Exclude(i => i.solution))
                .Skip(skip)
                .Limit(limit).ToEnumerable();

            if (d > 0)
            {
                Thread.Sleep(d);
            }
            foreach (var item in data)
            {
                yield return item;
            }
        }

        [HttpPost]
        public TableResponse Post([FromBody] TableRequest request)
        {
            var options = new FindOptions<CcData>();
            options.Limit = request.pageSize;
            options.Skip = request.page * request.pageSize;

            var matchBody = QueryUtils.Parse(
                request.filtered,
                new ParseUtilType
                {
                    Id = nameof(CcData.attempt),
                    Parser = f => null,
                }
            );
            var match = new BsonDocument("$match", matchBody);

            var sort = new BsonDocument("$sort", QueryUtils.Parse(
                request.sorted.Length == 0
                ? new TableRequestSort[] { new TableRequestSort() { id = "id.timestamp", desc = true } }
                : request.sorted
            ));

            var pipeline = new List<BsonDocument>() { match, sort };

            var attempt = request.filtered.FirstOrDefault(i => i.id == nameof(CcData.attempt) && i.value != "all");
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
