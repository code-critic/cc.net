using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using CC.Net.Collections;
using CC.Net.Config;
using CC.Net.Db;
using CC.Net.Dto;
using CC.Net.Extensions;
using CC.Net.Services;
using CC.Net.Services.Courses;
using CC.Net.Services.Languages;
using CC.Net.Utils;
using DiffPlex;
using DiffPlex.DiffBuilder;
using DiffPlex.DiffBuilder.Model;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;

namespace CC.Net.Controllers
{
    [ApiController]
    [Route("api")]
    public class ApiConfigController
    {
        private readonly CourseService _courseService;
        private readonly LanguageService _languageService;
        private readonly DbService _dbService;
        private readonly AppOptions _appOptions;
        private readonly ProblemDescriptionService _problemDescriptionService;
        private readonly CompareService _compareService;

        public ApiConfigController(
            CourseService courseService, LanguageService languageService, DbService dbService,
            AppOptions appOptions, ProblemDescriptionService problemDescriptionService,
            CompareService compareService
            )
        {
            _courseService = courseService;
            _languageService = languageService;
            _dbService = dbService;
            _appOptions = appOptions;
            _problemDescriptionService = problemDescriptionService;
            _compareService = compareService;
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

        [HttpGet("course/{courseId}")]
        public Course Course(string courseId)
        {
            return _courseService[courseId];
        }

        [HttpGet("course/{courseId}/{year}")]
        public CourseYearConfig CourseYearConfig(string courseId, string year)
        {
            return _courseService[courseId][year];
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

            var files = new DirectoryInfo(directory).GetFiles();

            return files.Select(i => new FileDto
            {
                Filename = i.Name,
                Content = i.FullName.ReadAllText()
            });
        }
    }
}