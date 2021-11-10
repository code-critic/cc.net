using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Cc.Net.Apis;
using CC.Net.Collections;
using CC.Net.Db;
using Cc.Net.Dto;
using Cc.Net.Exceptions;
using CC.Net.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;

namespace Cc.Net.Controllers
{
    
    [ApiController]
    [Route("api")]
    [Authorize]
    public class ResultsController : ControllerBase
    {
        private readonly IDbService _dbService;
        private readonly UserService _userService;
        private readonly UtilService _utilService;

        public ResultsController(IDbService dbService, UserService userService, UtilService utilService)
        {
            _dbService = dbService;
            _userService = userService;
            _utilService = utilService;
        }
        
        
        [HttpGet("result-get/{objectId}")]
        [ProducesResponseType(typeof(ApiResponse<CcData>), StatusCodes.Status200OK)]
        public async Task<IActionResult> ResultGet(string objectId)
        {
            var user = _userService.CurrentUser;
            await _utilService.MarkNotificationAsReadAsync(new ObjectId(objectId), user.Id);

            var id = new ObjectId(objectId);
            var item = (await _dbService.Data.SingleAsync(id))
                .IncludeDirectories(_utilService)
                .HideHiddenFiles(user.IsRoot);
            
            var result = new ApiResponse<CcData>(item);
            return Ok(result);
        }
        
               
        [HttpGet("file-get/{objectId}/{*path}")]
        [ProducesResponseType(typeof(IEnumerable<object>), StatusCodes.Status200OK)]
        public async Task<IActionResult> FileGet(string objectId, string path)
        {
            var id = new ObjectId(objectId);
            var item = await _dbService.Data.SingleAsync(id);
            var result = _utilService.GetFileContent(item, path);
            return Ok(result);
        }
        
        [HttpGet("reviewrequest/{objectId}")]
        public async Task<object> RequestCodeReview(string objectId)
        {
            var oid = new ObjectId(objectId);
            var user = _userService.CurrentUser;
            var sender = user.Id;

            // generate notifications
            var ccData = await _dbService.Data.SingleAsync(oid);
            _utilService.RequireAccess(ccData);

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
            var result = await _dbService.Data.UpdateDocumentAsync(ccData);
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
            var ccData = await _dbService.Data.SingleAsync(oid);
            _utilService.RequireAccess(ccData);
            var user = _userService.CurrentUser;

            ccData.ReviewRequest = null;
            var result = await _dbService.Data.UpdateDocumentAsync(ccData);
            var updated = (int) result.ModifiedCount;

            return new
            {
                status = "ok",
                updated
            };
        }
        
        [HttpGet("user-problem-results/{courseName}/{courseYear}/{problem}/{user}")]
        [ProducesResponseType(typeof(ApiListResponse<CcData>), StatusCodes.Status200OK)]
        public async Task<IActionResult> UserProblemResults(string courseName, string courseYear, string problem, string user)
        {

            var results = await _dbService.Resolve().Match(
                async mongoDb => mongoDb._data
                    .Find(i => i.CourseName == courseName
                            && i.CourseYear == courseYear
                            && i.Problem == problem
                            && (i.User == user || i.GroupUsers.Contains(user))
                        //  && i.Action == "solve"
                    )
                    .SortByDescending(i => i.Id)
                    .Limit(25)
                    .ToEnumerable()
                    .Select(_utilService.ConvertToExtended)
                    .ToList(),
                async inMemoryDb => (await _dbService.Data.FindAsync(i => i.CourseName == courseName
                            && i.CourseYear == courseYear
                            && i.Problem == problem
                            && (i.User == user || i.GroupUsers.Contains(user))))
                    .OrderByDescending(i => i.Id)
                    .Take(25)
                    .Select(_utilService.ConvertToExtended)
                    .ToList()
            );

            // var rng = new Random();
            // var options = (ProcessStatusCodes[]) Enum.GetValues(typeof(ProcessStatusCodes));
            // results.ForEach(i => i.Result.Status = (int) options[rng.Next(0, options.Length-1)]);

            var response = new ApiListResponse<CcData>(results);
            return Ok(response);
        }




        [HttpGet("user-problem-results-light/{courseName}/{courseYear}/{problem}/{user}")]
        [ProducesResponseType(typeof(ApiListResponse<CcDataLight>), StatusCodes.Status200OK)]
        public async Task<IActionResult> UserProblemResultsLightAsync(string courseName, string courseYear, string problem, string user)
        {
            var results = await _dbService.Resolve().Match(
                async mongoDb => mongoDb._data
                    .Find(i => i.CourseName == courseName
                            && i.CourseYear == courseYear
                            && i.Problem == problem
                            && (i.User == user || i.GroupUsers.Contains(user))
                    )
                    .SortByDescending(i => i.Id)
                    .Limit(25)
                    .Project(ProjectionDefinitions.CcData2CcDataLight)
                    .ToEnumerable()
                    .ToList(),
                async inMemoryDb => (await _dbService.Data.FindAsync(i => i.CourseName == courseName
                            && i.CourseYear == courseYear
                            && i.Problem == problem
                            && (i.User == user || i.GroupUsers.Contains(user))))
                    .OrderByDescending(i => i.Id)
                    .Take(25)
                    .Select(ProjectionDefinitions.SingleCcData2CcDataLight)
                    .ToList()
            );

            var response = new ApiListResponse<CcDataLight>(results);
            return Ok(response);
        }
    }
}