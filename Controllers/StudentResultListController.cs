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

            var match = new BsonDocument("$match", QueryUtils.Parse(request.filtered));
            var sort = new BsonDocument("$sort", QueryUtils.Parse(
                request.sorted.Length == 0
                ? new TableRequestSort[] { new TableRequestSort() { id = "id.timestamp", desc = true } }
                : request.sorted
            ));
            
            var data = _dbService.Data.Aggregate<CcData>(new BsonDocument[] {
                    match,
                    sort,
                    new BsonDocument("$skip", request.page * request.pageSize),
                    new BsonDocument("$limit", request.pageSize),
                }).ToEnumerable();

            return new TableResponse
            {
                count = _dbService.Data.Find(QueryUtils.Parse(request.filtered)).CountDocuments(),
                data = data,
            };
        }
    }
}
