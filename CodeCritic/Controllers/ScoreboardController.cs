using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Cc.Net.Utils;
using CC.Net.Collections;
using CC.Net.Db;
using CC.Net.Services;
using CC.Net.Services.Courses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using Newtonsoft.Json;

namespace CC.Net.Controllers
{
    [ApiController]
    [Route("api")]
    [Authorize]
    public class ScoreboardController : ControllerBase
    {
        private readonly UserService _userService;
        private readonly IDbService _dbService;
        private readonly CourseService _courseService;
        
        public ScoreboardController(UserService userService, IDbService dbService, CourseService courseService)
        {
            _userService = userService;
            _dbService = dbService;
            _courseService = courseService;
        }
        
        [HttpGet]
        [Route("student-scoreboard")]
        [UseCache(timeToLiveSeconds: 10, perUser: true)]
        [ProducesResponseType(typeof(IEnumerable<StudentScoreboardCourse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetStudentScoreboard()
        {
            var user = _userService.CurrentUser.Id;

            var items = (await _dbService.Data
                .FindAsync(i => (i.User == user || i.GroupUsers.Contains(user))
                    && i.Action == "solve"))
                .ToList();

            var courses = _courseService.Courses
                .SelectMany(i => i.CourseYears)
                .Where(i => i.SettingsConfig.AllStudents.Any(s => s.id == user))
                .ToList();

            var content = courses
                .SelectMany(i => i.Problems)
                .Select(i => new StudentScoreboardCourse
                {
                    CourseName = i.CourseYearConfig.Course.Name,
                    CourseYear = i.CourseYearConfig.Year,
                    Problem = i.Id,
                    CourseProblem = i,
                    Results = items.Where(j => j.CourseName == i.CourseYearConfig.Course.Name
                        && j.CourseYear == i.CourseYearConfig.Year
                        && j.Problem == i.Id)
                        .ToList(),
                })
                .OrderByDescending(i => i.CourseYear)
                    .ThenBy(i => i.CourseName)
                        .ThenBy(i => i.Since)
                            .ThenBy(i => i.Problem);

            return Ok(content);
        }
    }

    public class StudentScoreboardCourse
    {
        public string Problem { get; set; }
        public string CourseName { get; set; }
        public string CourseYear { get; set; }

        public DateTime Since => CourseProblem.Since;

        private CcData FinalResult => Results
            .Where(i => i.ReviewRequest != null)
            .OrderByDescending(i => i.Points)
                .ThenByDescending(i => i.Attempt)
            .FirstOrDefault();

        public float Score => FinalResult?.Points ?? -1;

        public string ObjectId => FinalResult?.ObjectId ?? string.Empty;

        public int ResultCount => Results.Count(i => i.Result.Status == (int)ProcessStatusCodes.AnswerCorrect
            || i.Result.Status == (int)ProcessStatusCodes.AnswerCorrectTimeout
        );


        [JsonIgnore]
        public IEnumerable<CcData> Results { private get; set; } = new List<CcData>();
        [JsonIgnore]
        public CourseProblem CourseProblem { private get; set; }
    }
}
