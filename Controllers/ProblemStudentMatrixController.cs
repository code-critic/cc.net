using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using CC.Net.Attributes;
using CC.Net.Collections;
using CC.Net.Db;
using CC.Net.Extensions;
using CC.Net.Services;
using CC.Net.Services.Courses;
using CC.Net.Utils;
using Microsoft.AspNetCore.Authorization;
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
    [Authorize]
    public class ProblemStudentMatrixController : ControllerBase
    {

        /*private string _aggregate_pipeline = @"{""pipeline"":
        [
            {
                ""$match"": {
                    ""action"": ""solve"",
                    ""course"": ""--COURSE--""
                }
            },
            {
                ""$sort"": {
                    ""points"": -1,
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
        [RequireRole(AppUserRoles.Root)]
        public IEnumerable<CcDataAgg> Get(string id, string year)
        {
            var course = _courseService[id];
            var problems = course[year].Problems.Select(i => i.Id);
            var users = course.CourseConfig.Students.Select(i => i.id);

            var courseName = $"{id}-{year}";
            var pipeline = BsonDocument.Parse(
                _aggregate_pipeline.Replace("--COURSE--", courseName)
                ).GetElement("pipeline").Value.AsBsonArray
                .ToList()
                .Select(i => i.AsBsonDocument);
            

            var data = _dbService.Data.Aggregate<CcDataAgg>(pipeline.ToArray())
                .ToEnumerable()
                .Where(i => !users.Any() || 
                    (users.Contains(i.id.user) && problems.Contains(i.id.problem))
                );
                
            return data;
        }*/
    }
}
