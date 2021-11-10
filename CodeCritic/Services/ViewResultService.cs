using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CC.Net.Collections;
using CC.Net.Db;
using Cc.Net.Dto;
using CC.Net.Utils;
using MongoDB.Bson;
using MongoDB.Driver;

namespace Cc.Net.Services
{
    public class ViewResultService
    {
        private IDbService _dbService;

        public ViewResultService(IDbService dbService)
        {
            _dbService = dbService;
        }

        public async Task<TableResponse> GetResultsAsync(TableRequest request)
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


            var matchBody = QueryUtils.Parse(filtered.ToArray());
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

            Console.WriteLine(pipeline.ToJson());

            return await _dbService.Resolve().Match(
                async mongoDb => {
                    if (attempt != null)
                    {
                        var data = await mongoDb._data.AggregateAsync<CcData>(pipeline.ToArray());
                        return new TableResponse
                        {
                            count = await mongoDb._data.CountDocumentsAsync(matchBody),
                            data = (await data.ToListAsync()).Select(CcDataDto.FromCcData),
                        };
                    }
                    else
                    {
                        var data = await mongoDb._data.AggregateAsync<CcData>(pipeline.ToArray());
                        return new TableResponse
                        {
                            count = await mongoDb._data.Find(matchBody).CountDocumentsAsync(),
                            data = (await data.ToListAsync()).Select(CcDataDto.FromCcData),
                        };
                    }
                },
                async inMemoryDb => new TableResponse{
                    count = 0,
                    data = new List<CcDataDto>(),
                }
            );
        }
    }
}