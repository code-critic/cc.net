using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using CC.Net.Collections;
using CC.Net.Config;
using CC.Net.Db;
using CC.Net.Dto;
using CC.Net.Services;
using CC.Net.Services.Courses;
using CC.Net.Services.Languages;
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

        public ApiConfigController(CourseService courseService, 
            LanguageService languageService, DbService dbService, AppOptions appOptions, ProblemDescriptionService problemDescriptionService)
        {
            _courseService = courseService;
            _languageService = languageService;
             _dbService = dbService;
             _appOptions = appOptions;
            _problemDescriptionService = problemDescriptionService;
        }

        [HttpGet("courses")]
        public List<Course> Courses()
        {
            return _courseService.Courses;
        }

        [HttpGet("courses-full/{courseId}/{year}")]
        public List<CourseProblem> CourseFull(string courseId, string year)
        {
            var course = _courseService[courseId];
            var yearConfig = course[year];

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

        [HttpGet("diff/{objectId}")]
        public IEnumerable<DiffResult> ViewDiff(string objectId)
        {
            var data = _dbService.Data
                .Find(i => i.id == new ObjectId(objectId))
                .First();

            var problem = _courseService[data.courseName][data.courseYear][data.problem];
            var solutionDir = Path.Combine(_appOptions.RootDir, data.output_dir, "output");
            var studentDirInfo = new DirectoryInfo(solutionDir);
            var courseDirInfo = new DirectoryInfo(
                Path.Combine(
                    _appOptions.CourseDir, data.courseName, data.courseYear, "problems", data.problem, "output"
                )
            );
            foreach(var refO in courseDirInfo.GetFiles()) {
                var studentO = new FileInfo(Path.Combine(solutionDir, refO.Name));
                var diffBuilder = new InlineDiffBuilder(new Differ());
                var diff = diffBuilder.BuildDiffModel(
                    File.ReadAllText(refO.ToString()), File.ReadAllText(studentO.ToString())
                );

                yield return new DiffResult() {
                    filename = refO.Name,
                    lines = diff.Lines
                };
                foreach (var line in diff.Lines)
                {
                    switch (line.Type)
                    {
                        case ChangeType.Inserted:
                            Console.ForegroundColor = ConsoleColor.Red;
                            Console.Write("+ ");
                            break;
                        case ChangeType.Deleted:
                            Console.ForegroundColor = ConsoleColor.Green;
                            Console.Write("- ");
                            break;
                        default:
                            Console.ForegroundColor = ConsoleColor.White;
                            Console.Write("  ");
                            break;
                    }

                    Console.WriteLine(line.Text);
                }
            }
        }
    }
}