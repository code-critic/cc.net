using CC.Net.Db;
using Cc.Net.Services;
using CC.Net.Services;
using CC.Net.Services.Courses;
using CC.Net.Services.Languages;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;
using MongoDB.Bson;
using CC.Net.Attributes;
using Cc.Net.Extensions;
using System.Collections.Generic;
using CC.Net.Dto;
using System.Linq;

namespace CC.Net.Controllers
{
    [ApiController]
    [Route("api")]
    [Authorize]
    public partial class TeacherController : ControllerBase
    {

        private readonly ILogger<TeacherController> _logger;
        private readonly DbService _dbService;
        private readonly CourseService _courseService;
        private readonly LanguageService _languageService;
        private readonly UserService _userService;
        private readonly UtilService _utilService;
        private readonly SubmitSolutionService _submitSolutionService;
        public const string RerunSolutionUrl = "rerun-solution";

        public TeacherController(DbService dbService, CourseService courseService, LanguageService languageService,
            UserService userService, UtilService utilService, SubmitSolutionService submitSolutionService,
            ILogger<TeacherController> logger)
        {
            _logger = logger;
            _dbService = dbService;
            _courseService = courseService;
            _languageService = languageService;
            _userService = userService;
            _utilService = utilService;
            _submitSolutionService = submitSolutionService;
        }

        [HttpGet(RerunSolutionUrl + "/{objectId}")]
        [RequireRole(AppUserRoles.Root)]
        public async Task<IActionResult> RerunSolution(string objectId)
        {
            var data = await _dbService.DataSingleAsync(new ObjectId(objectId));
            var newData = data.GroupId != ObjectId.Empty
                ? await _submitSolutionService
                    .CreateItemSolveGroup(data.GroupId.ToString(),
                        data.CourseName, data.CourseYear, data.Problem, data.Language,
                        new List<SimpleFileDto> { })
                : await _submitSolutionService
                    .CreateItemSolveStudent(data.User,
                        data.CourseName, data.CourseYear, data.Problem, data.Language,
                        new List<SimpleFileDto> { });

            var newSolutions = data.Solutions
                .Select(i => newData.Solutions.FirstOrDefault(j => j.Filename == i.Filename) ?? i)
                .ToList();

            newData.Solutions = newSolutions;
            newData.Id = data.Id;
            await _dbService.Data.UpdateDocumentAsync(newData);
            return Ok();
        }
    }
}
