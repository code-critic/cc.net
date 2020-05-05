using System.Collections.Generic;
using System.Threading.Tasks;
using CC.Net.Db;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;

namespace CC.Net.Controllers
{
    [ApiController]
    [Route("api")]
    public class CommentsController
    {
        private readonly DbService _dbService;

        public CommentsController(DbService dbService)
        {
            _dbService = dbService;
        }

        [HttpPost("comments")]
        public async Task<object> PostComments(IEnumerable<CommentServiceItem> items)
        {
            var updated = 0;
            foreach (var item in items)
            {
                var objectId = new ObjectId(item.objectId);
                var data = _dbService.Data
                    .Find(i => i.Id == objectId)
                    .First();

                data.Comments.Add(item.comment);
                var result = await _dbService.Data.ReplaceOneAsync(i => i.Id == objectId, data);
                updated += (int) result.ModifiedCount;
            }

            return new {
                status = updated > 0 ? "ok" : "error",
                updated
            };
        }
    }
}