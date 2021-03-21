using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CC.Net.Collections;
using CC.Net.Db;
using CC.Net.Services;
using CC.Net.Services.Courses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;

namespace CC.Net.Controllers
{
    [ApiController]
    [Route("api")]
    [Authorize]
    public class CommentsController
    {
        private readonly DbService _dbService;
        private readonly UserService _userService;
        private readonly UtilService _utilService;

        public CommentsController(DbService dbService, UserService userService, CourseService courseService,
            UtilService utilService)
        {
            _dbService = dbService;
            _userService = userService;
            _utilService = utilService;
        }

        [HttpGet("notification/mark-as-read/{objectId}")]
        public async Task<object> MarkAsRead(string objectId)
        {
            var user = _userService.CurrentUser.Id;
            var oid = new ObjectId(objectId);
            var ccEvent = (await _dbService.Events.FindAsync(i => i.Id == oid)).FirstOrDefault();
            var deletedCount = await _utilService.MarkNotificationAsReadAsync(ccEvent) +
                               await _utilService.MarkNotificationAsReadAsync(ccEvent?.ResultId, user);

            return new
            {
                status = deletedCount >= 1 ? "ok" : "error",
                updated = deletedCount
            };
        }

        [HttpGet("reviewrequest/{objectId}")]
        public async Task<object> RequestCodeReview(string objectId)
        {
            var oid = new ObjectId(objectId);
            var sender = _userService.CurrentUser.Id;

            // generate notifications
            var ccData = await _dbService.DataSingleOrDefaultAsync(oid);
            var recipients = _utilService.GetUsersRelatedToResult(ccData);

            await _utilService.SendNotificationAsync(recipients,
                new CcEvent
                {
                    ResultId = oid,
                    Type = CcEventType.NewCodeReview,
                    IsNew = true,
                    Sender = sender,
                });

            ccData.ReviewRequest = System.DateTime.Now;
            var result = await _dbService.Data.ReplaceOneAsync(i => i.Id == oid, ccData);
            var updated = (int) result.ModifiedCount;

            return new
            {
                status = "ok",
                updated
            };
        }

        [HttpDelete("reviewrequest/{objectId}")]
        public async Task<object> CancelCodeReview(string objectId)
        {
            var oid = new ObjectId(objectId);
            var data = _dbService.Data
                .Find(i => i.Id == oid)
                .First();

            data.ReviewRequest = null;
            var result = await _dbService.Data.ReplaceOneAsync(i => i.Id == oid, data);
            var updated = (int) result.ModifiedCount;

            return new
            {
                status = "ok",
                updated
            };
        }

        [HttpPost("comments")]
        public async Task<object> PostComments(IList<CommentServiceItem> items)
        {
            var sender = _userService.CurrentUser.Id;
            var updated = 0;
            if (items.Any())
            {
                CcData data;
                foreach (var item in items)
                {
                    item.comment.User = sender;
                    var objectId = new ObjectId(item.objectId);
                    data = await _dbService.DataSingleOrDefaultAsync(objectId);
                    data.Comments.Add(item.comment);

                    var result = await _dbService.Data.ReplaceOneAsync(i => i.Id == objectId, data);
                    updated += (int) result.ModifiedCount;
                }

                var oid = new ObjectId(items.First().objectId);
                var ccData = await _dbService.DataSingleOrDefaultAsync(oid);
                var recipients = _utilService.GetUsersRelatedToResult(ccData);
                
                await _utilService.SendNotificationAsync(recipients,
                    new CcEvent
                    {
                        ResultId = oid,
                        Type = CcEventType.NewComment,
                        IsNew = true,
                        Sender = sender,
                    });
            }

            return new
            {
                status = updated > 0 ? "ok" : "error",
                updated
            };
        }
    }
}