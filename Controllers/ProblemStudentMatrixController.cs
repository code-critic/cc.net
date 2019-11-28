using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using CC.Net.Collections;
using CC.Net.Db;
using CC.Net.Extensions;
using CC.Net.Services.Courses;
using CC.Net.Utils;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Driver;
using Newtonsoft.Json;

namespace CC.Net.Controllers
{

    [ApiController]
    [Route("api")]
    public class ProblemStudentMatrixController : ControllerBase
    {

        private string _aggregate_pipeline = @"{""pipeline"":
        [
            {
                ""$match"": {
                    ""action"": ""solve"",
                    ""course"": ""--COURSE--""
                }
            },
            {
                ""$sort"": {
                    ""result.score"": -1
                }
            },
            {
                ""$group"": {
                    ""_id"": {
                        ""user"": ""$user"",
                        ""problem"": ""$problem""
                    },
                    ""result"": {""$first"": ""$$ROOT""}
                }
            },
            {
                ""$project"": {
                    ""result.results"" : 0,
                    ""result.solution"" : 0
                }
            }
        ]}";

        private readonly ILogger<ProblemStudentMatrixController> _logger;
        private readonly DbService _dbService;
        private readonly CourseService _courseService;

        public ProblemStudentMatrixController(ILogger<ProblemStudentMatrixController> logger, DbService dbService, CourseService courseService)
        {
            _logger = logger;
            _dbService = dbService;
            _courseService = courseService;
        }

        [HttpGet]
        [Route("problem-student-matrix/{id}/{year}")]
        public List<CourseProblem> Get(string id, string year)
        {
            var course = _courseService[id];
            var problems = course[year].Problems;
            var users = course.CourseConfig.students;

            return problems;
        }

        [HttpGet]
        [Route("problem-student-matrix/{id}/{year}/a")]
        public IEnumerable<CcDataAgg> Geta(string id, string year)
        {
            var course = _courseService[id];
            var problems = course[year].Problems.Select(i => i.id);
            var users = course.CourseConfig.students.Select(i => i.id);

            var courseName = $"{id}-{year}";
            var pipeline = BsonDocument.Parse(
                _aggregate_pipeline.Replace("--COURSE--", courseName)
                ).GetElement("pipeline").Value.AsBsonArray
                .ToList()
                .Select(i => i.AsBsonDocument);
            

            var data = _dbService.Data.Aggregate<CcDataAgg>(pipeline.ToArray())
                .ToEnumerable()
                .Where(i => users.Contains(i.id.user) && problems.Contains(i.id.problem));
                

            return data;
        }
    }
}
