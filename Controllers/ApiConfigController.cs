using System.Collections.Generic;
using CC.Net.Collections;
using CC.Net.Db;
using CC.Net.Dto;
using CC.Net.Services.Courses;
using CC.Net.Services.Languages;
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

        public ApiConfigController(CourseService courseService, LanguageService languageService, DbService dbService)
        {
            _courseService = courseService;
            _languageService = languageService;
             _dbService = dbService;
        }

        [Route("courses")]
        public List<Course> Courses()
        {
            return _courseService.Courses;
        }

        [Route("languages")]
        public List<Language> Languages()
        {
            return _languageService.Languages;
        }

        [Route("course/{courseId}")]
        public Course Course(string courseId)
        {
            return _courseService[courseId];
        }

        [Route("course/{courseId}/{year}")]
        public CourseYearConfig CourseYearConfig(string courseId, string year)
        {
            return _courseService[courseId][year];
        }

        [Route("course/{courseId}/{year}/{problemId}")]
        public CourseProblem CourseProblem(string courseId, string year, string problemId)
        {
            return _courseService[courseId][year][problemId];
        }

        [Route("course/{courseId}/{year}/{problemId}/{caseId}")]
        public CourseProblemCase CourseProblemCase(string courseId, string year, string problemId, string caseId)
        {
            return _courseService[courseId][year][problemId][caseId];
        }


        [Route("mark-solution")]
        public UpdateResult MarkSolution([FromBody] MarkSolutionItem item)
        {
            var filter = Builders<CcData>.Filter.Eq("id", new ObjectId(item.objectId));
            var update = Builders<CcData>.Update.Set("points", item.points);
            return _dbService.Data
                .UpdateOne(filter, update);
        }
    }
}