using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Claims;
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
    public class ApiConfigController
    {
        private readonly CourseService _courseService;
        private readonly LanguageService _languageService;
        private readonly DbService _dbService;
        private readonly ProblemDescriptionService _problemDescriptionService;
        private readonly CompareService _compareService;
        private readonly UserService _userService;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public ApiConfigController(
            CourseService courseService, LanguageService languageService, DbService dbService,
            ProblemDescriptionService problemDescriptionService,
            CompareService compareService, IHttpContextAccessor httpContextAccessor, UserService userService
            )
        {
            _courseService = courseService;
            _languageService = languageService;
            _dbService = dbService;
            _problemDescriptionService = problemDescriptionService;
            _compareService = compareService;
            _userService = userService;
        }

        [HttpGet("courses")]
        public List<Course> Courses()
        {
            return _courseService.Courses;
        }
        
        [HttpGet("courses-full/{courseName}/{courseYear}")]
        public List<CourseProblem> CourseFull(string courseName, string courseYear)
        {
            var course = _courseService[courseName];
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
        public CcData GetResult(string objectId)
        {
            var id = new ObjectId(objectId);
            return _dbService.Data
                .Find(i => i.Id == id)
                .FirstOrDefault();
        }

        [HttpGet("course/{courseId}")]
        public Course Course(string courseId)
        {
            return _courseService[courseId];
        }

        [HttpGet("course/{courseId}/{year}")]
        public CourseYearConfig CourseYearConfig(string courseId, string year)
        {
            var course = _courseService[courseId];
            var yearConfig = course[year];

            var singleCourse = new SingleCourse
            {
                CourseRef = course,
                Course = course.Name,
                Year = yearConfig.Year,
                CourseConfig = course.CourseConfig,
                Problems = yearConfig.Problems,
            };

            var currentUser = _userService.CurrentUser.Id;
            var problems = yearConfig.Problems.Select(i => i.Id).ToList();
            var results = _dbService.Data
                .Find(i => i.User == currentUser && problems.Contains(i.Problem))
                .ToList()
                .OrderByDescending(i => i.Result.Score)
                    .ThenByDescending(i => i.Attempt)
                .GroupBy(i => i.Problem)
                .Select(i => i.Take(3).ToList())
                .ToList();
            var cfg = _courseService[courseId][year];
            cfg.Results = results;
            cfg.Problems = cfg.Problems
                .Select(i => i.AddDescription(_problemDescriptionService, singleCourse))
                .ToList();
            return cfg;
        }

        [HttpGet("course/{courseId}/{year}/{problemId}")]
        public CourseProblem CourseProblem(string courseId, string year, string problemId)
        {
            var problem = _courseService[courseId][year][problemId];
            return problem;
        }

        [HttpGet("course/{courseId}/{year}/{problemId}/{caseId}")]
        public CourseProblemCase CourseProblemCase(string courseId, string year, string problemId, string caseId)
        {
            return _courseService[courseId][year][problemId][caseId];
        }


        [HttpGet("mark-solution")]
        public UpdateResult MarkSolution([FromBody] MarkSolutionItem item)
        {
            var filter = Builders<CcData>.Filter.Eq("id", new ObjectId(item.objectId));
            var update = Builders<CcData>.Update.Set("points", item.points);
            return _dbService.Data
                .UpdateOne(filter, update);
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
    }
}