using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using cc.net.Dto;
using cc.net.Extensions;
using CC.Net.Attributes;
using CC.Net.Collections;
using CC.Net.Config;
using CC.Net.Db;
using CC.Net.Dto;
using CC.Net.Entities;
using CC.Net.Extensions;
using CC.Net.Services;
using CC.Net.Services.Courses;
using CC.Net.Services.Languages;
using CC.Net.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;

namespace CC.Net.Controllers
{
    [ApiController]
    [Route("api")]
    [Authorize]
    public class ApiConfigController: ControllerBase
    {
        private readonly CourseService _courseService;
        private readonly LanguageService _languageService;
        private readonly DbService _dbService;
        private readonly ProblemDescriptionService _problemDescriptionService;
        private readonly AppOptions _appOptions;
        private readonly CompareService _compareService;
        private readonly UserService _userService;
        private readonly UtilService _utilService;
        private readonly IHttpContextAccessor _httpContextAccessor;

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

        [HttpGet("courses")]
        public IEnumerable<Course> Courses()
        {
            return _courseService.GetAllowedCoursesForUser(_userService.CurrentUser);
        }
        
        [HttpGet("test-config/{courseName}/{courseYear}")]
        public object GetTestYaml(string courseName, string courseYear)
        {
            var course = _courseService.GetCourseForUser(_userService.CurrentUser, courseName);
            var yearConfig = course[courseYear];
            return new { data = yearConfig.Yaml };
        }

        [HttpGet("courses-full/{courseName}/{courseYear}")]
        public List<CourseProblem> CourseFull(string courseName, string courseYear)
        {
            var course = _courseService.GetCourseForUser(_userService.CurrentUser, courseName);
            var yearConfig = course[courseYear];

            var singleCourse = new SingleCourse
            {
                CourseRef = course,
                Course = course.Name,
                Year = yearConfig.Year,
                CourseConfig = course.CourseConfig,
                Problems = yearConfig.Problems,
            };

            var problems = yearConfig
                .Problems
                .Select(i => i.AddDescription(_problemDescriptionService, singleCourse))
                .ToList();

            return problems;
        }

        [HttpGet("languages")]
        public List<Language> Languages()
        {
            return _languageService.Languages;
        }

        [HttpGet("result/{objectId}")]
        public async Task<CcData> GetResult(string objectId)
        {
            var user = _userService.CurrentUser.Id;
            await _utilService.MarkNotificationAsReadAsync(new ObjectId(objectId), user);

            var id = new ObjectId(objectId);
            var item = _dbService.Data
                .Find(i => i.Id == id)
                .FirstOrDefault();

            return _utilService.ConvertToExtended(item);
        }

        [HttpGet("course/{courseName}")]
        public Course Course(string courseName)
        {
            return _courseService.GetCourseForUser(_userService.CurrentUser, courseName);
        }

        [HttpGet("grade-stats/{courseName}/{year}/{problemId}")]
        [RequireRole(AppUserRoles.Root)]
        public List<GradeDto> GetProblemStats(string courseName, string year, string problemId)
        {
            var course = _courseService.GetCourseForUser(_userService.CurrentUser, courseName);
            var yearConfig = course[year];
            var visibleProblems = yearConfig.GetAllowedProblemForUser(_userService.CurrentUser);
            var problem = visibleProblems.FirstOrDefault(i => i.Id == problemId);

            if(problem == null)
            {
                return new List<GradeDto>();
            }

            var students = course.CourseConfig.Students;
            var ids = students.Select(i => i.id).ToList();
            var items = _dbService.Data
                .Find(i => ids.Contains(i.User)
                    && i.CourseName == course.Name
                    && i.CourseYear == yearConfig.Year
                    && i.Problem == problem.Id
                    && i.ReviewRequest != null)
                .ToList()
                .OrderByDescending(i => i.Points)
                    .ThenByDescending(i => i.Result.Score)
                .ToList();

            var bestResults = new List<GradeDto>();
            foreach(var student in students)
            {
                var best = items.FirstOrDefault(i => i.User == student.id);
                bestResults.Add(new GradeDto
                {
                    Result = best ?? GradeDto.EmptyResult(course, yearConfig, problem, student),
                    User = student
                });
            }
            return bestResults;
        }

        [HttpGet("course/{courseName}/{year}")]
        public CourseYearConfig CourseYearConfig(string courseName, string year)
        {
            var course = _courseService.GetCourseForUser(_userService.CurrentUser, courseName);
            var yearConfig = course[year];
            var visibleProblems = yearConfig
                .GetAllowedProblemForUser(_userService.CurrentUser)
                .ToList();

            var singleCourse = new SingleCourse
            {
                CourseRef = course,
                Course = course.Name,
                Year = yearConfig.Year,
                CourseConfig = course.CourseConfig,
                Problems = visibleProblems,
            };

            var currentUser = _userService.CurrentUser.Id;
            var problems = visibleProblems.Select(i => i.Id).ToList();
            var results = _dbService.Data
                .Find(i => i.User == currentUser
                    && i.CourseName == course.Name
                    && i.CourseYear == yearConfig.Year
                    && problems.Contains(i.Problem))
                .ToList()
                .OrderByDescending(i => i.Result.Score)
                    .ThenByDescending(i => i.Attempt)
                .GroupBy(i => i.Problem)
                .Select(i => i.Take(3).ToList())
                .ToList();

            var cfg = _courseService[courseName][year];
            cfg.Results = results;
            cfg.Problems = cfg.Problems
                .Select(i => i.AddDescription(_problemDescriptionService, singleCourse))
                .ToList();
            return cfg;
        }

        [HttpGet("course/{courseName}/{year}/{problemId}")]
        public CourseProblem CourseProblem(string courseName, string year, string problemId)
        {
            var problem = _courseService[courseName][year][problemId];
            return problem;
        }

        [HttpGet("course/{courseName}/{year}/{problemId}/{caseId}")]
        public CourseProblemCase CourseProblemCase(string courseName, string year, string problemId, string caseId)
        {
            return _courseService[courseName][year][problemId][caseId];
        }


        [HttpGet("mark-solution")]
        [RequireRole(AppUserRoles.Root)]
        public UpdateResult MarkSolution([FromBody] MarkSolutionItem item)
        {
            var filter = Builders<CcData>.Filter.Eq("id", new ObjectId(item.objectId));
            var update = Builders<CcData>.Update.Set("points", item.points);
            return _dbService.Data
                .UpdateOne(filter, update);
        }

        [HttpPost("save-grade")]
        [RequireRole(AppUserRoles.Root)]
        public async Task<object> SaveGrade(MarkSolutionItem item)
        {
            var objectId = new ObjectId(item.objectId);
            var doc = _dbService.Data.Find(i => i.Id == objectId).Single();
            var sender = _userService.CurrentUser.Id;
            var recipient = doc.User;

            doc.Points = item.points;
            doc.GradeComment = item.comment;

            await _utilService.MarkNotificationAsReadAsync(objectId, sender);

            var result = await _dbService.Data.UpdateDocumentAsync(doc);
            if(result.IsAcknowledged)
            {
                await _dbService.Events.InsertOneAsync(new CcEvent
                {
                    Id = ObjectId.GenerateNewId(),
                    ResultId = objectId,
                    Type = CcEventType.NewGrade,
                    Subject = $"`[{doc.CourseName}]`: Recieved `{item.points}%` in problem `{doc.Problem}`",
                    IsNew = true,
                    Sender = sender,
                    Reciever = recipient,
                });
            }
            return new
            {
                status = result.IsAcknowledged ? "ok" : "error"
            };
        }

        [HttpGet("diff/{objectId}/{caseId}")]
        public DiffResultComposite ViewDiff(string objectId, string caseId)
        {
            var data = _dbService.Data
                .Find(i => i.Id == new ObjectId(objectId))
                .First();

            var context = new CourseContext(_courseService, _languageService, data);
            var generatedFile = context.StudentDir.OutputFile(caseId);
            var referenceFile = context.ProblemDir.OutputFile(caseId);
            return _compareService.CompareFilesComposite(generatedFile, referenceFile);
        }

        [HttpGet("browse-dir/{objectId}/{dir}")]
        public IEnumerable<FileDto> BrowseDir(string objectId, string dir)
        {
            var allowed = new string[] { "input", "output", "error", "reference" };
            var data = _dbService.Data
                .Find(i => i.Id == new ObjectId(objectId))
                .First();

            var context = new CourseContext(_courseService, _languageService, data);
            var dirName = dir.ToLower();

            if (!allowed.Any(i => i == dirName))
            {
                throw new Exception("Access denied");
            }

            var directory = dirName == "reference"
                ? context.ProblemDir.OutputDir
                : data.Action != "solve"
                    ? context.ProblemDir.RootFile(dirName)
                    : context.StudentDir.RootFile(dirName);

            if (!Directory.Exists(directory))
            {
                return new FileDto[] { };
            }

            var files = new DirectoryInfo(directory)
                .GetFiles()
                .OrderBy(i => i.Name);

            return files.Select(i => new FileDto
            {
                Filename = i.Name,
                Content = i.FullName.ReadAllText()
            });
        }

        [HttpGet("rename/{id}")]
        [RequireRole(AppUserRoles.Root)]
        public async Task<object> ChangeUser(string id)
        {
            var user = _userService.CurrentUser;
            if (_appOptions.Admins.Contains(user.Id) || user.IsRoot)
            {
                var newuser = user.Copy();
                newuser.Eppn = $"{id}@tul.cz";
                newuser.Elevate();
                await _userService.SignInAsync(HttpContext, newuser);

                return new
                {
                    code = 200,
                    status = "ok",
                    message = "user changed",
                };
            }
            else
            {
                return new
                {
                    code = 401,
                    status = "error",
                    message = "access denied",
                };
            }
        }
    }
}