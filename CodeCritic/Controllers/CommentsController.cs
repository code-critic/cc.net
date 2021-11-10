using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CC.Net.Collections;
using CC.Net.Db;
using CC.Net.Extensions;
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
        private readonly IDbService _dbService;
        private readonly UserService _userService;
        private readonly UtilService _utilService;

        public CommentsController(IDbService dbService, UserService userService, CourseService courseService,
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

        [HttpPost("comments")]
        public async Task<object> PostComments(IList<CommentServiceItem> items)
        {
            var sender = _userService.CurrentUser.Id;
            var updated = 0;
            if (items.Any())
            {
                foreach (var item in items)
                {
                    item.comment.User = sender;
                    var objectId = new ObjectId(item.objectId);
                    var data = await _dbService.Data.SingleAsync(objectId);
                    _utilService.RequireAccess(data);
                    var finished = new CcData.LineComment {
                        Time = DateTimeOffset.Now.ToUnixTimeSeconds(),
                        Text = item.comment.Text.ToMarkdown(),
                        User = sender,
                        Filename = item.comment.Filename,
                        Line = item.comment.Line,
                    };
                    data.Comments.Add(finished);

                    var result = await _dbService.Data.UpdateDocumentAsync(data);
                    updated += result.ModifiedCount;
                }

                var oid = new ObjectId(items.First().objectId);
                var ccData = await _dbService.Data.SingleAsync(oid);
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