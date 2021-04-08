using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Cc.Net.Dto;
using Cc.Net.Extensions;
using Cc.Net.Utils;
using CC.Net.Attributes;
using CC.Net.Collections;
using CC.Net.Config;
using CC.Net.Db;
using CC.Net.Dto;
using CC.Net.Extensions;
using CC.Net.Services;
using CC.Net.Services.Courses;
using CC.Net.Services.Languages;
using CC.Net.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;

namespace CC.Net.Controllers
{
    [ApiController]
    [Route("api")]
    [Authorize]
    public partial class ApiConfigController : ControllerBase
    {
        private readonly CourseService _courseService;
        private readonly LanguageService _languageService;
        private readonly DbService _dbService;
        private readonly ProblemDescriptionService _problemDescriptionService;
        private readonly AppOptions _appOptions;
        private readonly CompareService _compareService;
        private readonly UserService _userService;
        private readonly UtilService _utilService;

        public ApiConfigController(
            CourseService courseService, LanguageService languageService, DbService dbService,
            ProblemDescriptionService problemDescriptionService, AppOptions appOptions,
            CompareService compareService, IHttpContextAccessor httpContextAccessor, UserService userService,
            UtilService utilService
        )
        {
            _courseService = courseService;
            _languageService = languageService;
            _dbService = dbService;
            _problemDescriptionService = problemDescriptionService;
            _appOptions = appOptions;
            _compareService = compareService;
            _userService = userService;
            _utilService = utilService;
        }

        [HttpPost("save-grade")]
        [RequireRole(AppUserRoles.Root)]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        public async Task<object> SaveGrade(MarkSolutionItem item)
        {
            var oid = new ObjectId(item.objectId);
            var ccData = await _dbService.DataSingleAsync(oid);
            var sender = _userService.CurrentUser.Id;
            var recipients = _utilService.GetUsersRelatedToResult(ccData);

            ccData.Points = item.points;
            ccData.GradeComment = item.comment;

            await _utilService.MarkNotificationAsReadAsync(oid, sender);

            var result = await _dbService.Data.UpdateDocumentAsync(ccData);
            var notificationCount = default(int);

            if (result.IsAcknowledged)
            {
                notificationCount = await _utilService.SendNotificationAsync(recipients,
                    new CcEvent
                    {
                        ResultId = oid,
                        Type = CcEventType.NewGrade,
                        IsNew = true,
                        Subject = $"**[{ccData.CourseName}]**: Received **{item.points}%** in problem **{ccData.Problem}**",
                        Sender = sender,
                    });
            }

            return new
            {
                status = result.IsAcknowledged ? "ok" : "error",
                count = notificationCount
            };
        }

        [HttpGet("diff/{objectId}/{caseId}")]
        [UseCache(timeToLiveSeconds: 60)]
        [ProducesResponseType(typeof(DiffResultComposite), StatusCodes.Status200OK)]
        public async Task<IActionResult> ViewDiff(string objectId, string caseId)
        {
            var data = await _dbService.DataSingleAsync(new ObjectId(objectId));

            var context = new CourseContext(_courseService, _languageService, data);
            var generatedFile = context.StudentDir.OutputFile(caseId);
            var referenceFile = context.ProblemDir.OutputFile(caseId);
            return Ok(_compareService.CompareFilesComposite(generatedFile, referenceFile));
        }
    }
}