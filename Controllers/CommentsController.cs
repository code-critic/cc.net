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
        private readonly CourseService _courseService;
        private readonly UtilService _utilService;

        public CommentsController(DbService dbService, UserService userService, CourseService courseService, UtilService utilService)
        {
            _dbService = dbService;
            _userService = userService;
            _courseService = courseService;
            _utilService = utilService;
        }

        [HttpGet("notification/mark-as-read/{objectId}")]
        public async Task<object> MarkAsRead(string objectId)
        {
            var user = _userService.CurrentUser.Id;
            var oid = new ObjectId(objectId);
            var ccEvent = (await _dbService.Events.FindAsync(i => i.Id == oid)).FirstOrDefault();
            var deletedCount = await _utilService.MarkNotificationAsReadAsync(ccEvent) + await _utilService.MarkNotificationAsReadAsync(ccEvent?.ResultId, user);

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

            // generate notifications
            var ccData = await _dbService.DataSingleOrDefaultAsync(oid);
            var teachers = _courseService[ccData?.CourseName]?.CourseConfig?.Teachers ?? new List<Entities.User>();
            foreach (var teacher in teachers)
            {
                var sender = _userService.CurrentUser.Id;
                var reciever = teacher.id;
                await _dbService.Events.InsertOneAsync(new CcEvent
                {
                    Id = ObjectId.GenerateNewId(),
                    ResultId = ObjectId.Parse(objectId),
                    Type = CcEventType.NewCodeReview,
                    IsNew = true,
                    Sender = sender,
                    Reciever = reciever,
                });
            }

            var data = _dbService.Data
                .Find(i => i.Id == oid)
                .First();

            data.ReviewRequest = System.DateTime.Now;
            var result = await _dbService.Data.ReplaceOneAsync(i => i.Id == oid, data);
            var updated = (int)result.ModifiedCount;

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
            var updated = (int)result.ModifiedCount;

            return new
            {
                status = "ok",
                updated
            };
        }

        [HttpPost("comments")]
        public async Task<object> PostComments(IEnumerable<CommentServiceItem> items)
        {
            var updated = 0;
            if (items.Any())
            {
                var data = (CcData) null;
                foreach (var item in items)
                {
                    var objectId = new ObjectId(item.objectId);
                    data = await _dbService.DataSingleOrDefaultAsync(objectId);
                    data.Comments.Add(item.comment);

                    var result = await _dbService.Data.ReplaceOneAsync(i => i.Id == objectId, data);
                    updated += (int)result.ModifiedCount;
                }

                var oid = new ObjectId(items.First().objectId);
                var ccData = await _dbService.DataSingleOrDefaultAsync(oid);

                // generate notifications
                var teachers = _courseService[ccData?.CourseName]?.CourseConfig?.Teachers
                    ?? new List<Entities.User>();

                var recipients = new List<string> { data.User };
                recipients.AddRange(teachers.Select(i => i.id));
                recipients.AddRange(data?.Comments?.Select(i => i.User) ?? new List<string>());
                recipients = recipients.Distinct().ToList();

                foreach (var recipient in recipients)
                {
                    var sender = _userService.CurrentUser.Id;
                    if (sender != recipient)
                    {
                        await _dbService.Events.InsertOneAsync(new CcEvent
                        {
                            Id = ObjectId.GenerateNewId(),
                            ResultId = oid,
                            Type = CcEventType.NewComment,
                            IsNew = true,
                            Sender = sender,
                            Reciever = recipient,
                        });
                    }
                }
            }

            return new
            {
                status = updated > 0 ? "ok" : "error",
                updated
            };
        }
    }
}