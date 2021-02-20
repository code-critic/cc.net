using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using CC.Net.Attributes;
using CC.Net.Collections;
using CC.Net.Db;
using CC.Net.Extensions;
using CC.Net.Services;
using CC.Net.Services.Courses;
using CC.Net.Services.Languages;
using CC.Net.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using MongoDB.Bson;
using MongoDB.Driver;
using Newtonsoft.Json;
using static CC.Net.Collections.CcData;

namespace CC.Net.Controllers
{
    public partial class StudentController : ControllerBase
    {

        [HttpGet]
        [Route("student-scoreboard")]
        public IEnumerable<StudentScoreboardCourse> GetStudentScoreboard()
        {
            var user = _userService.CurrentUser.Id;

            var items = _dbService.Data
                .Find(i => (i.User == user || i.GroupUsers.Contains(user))
                    && i.Action == "solve")
                .ToList();

            var courses = _courseService.Courses
                .SelectMany(i => i.CourseYears)
                .Where(i => i.SettingsConfig.AllStudents.Any(s => s.id == user)).ToList();

            return courses
                .SelectMany(i => i.Problems)
                .Select(i => new StudentScoreboardCourse
                {
                    CourseName = i.CourseYearConfig.Course.Name,
                    CourseYear = i.CourseYearConfig.Year,
                    Problem = i.Id,
                    CourseProblem = i,
                    Results = items.Where(j => j.CourseName == i.CourseYearConfig.Course.Name
                        && j.CourseYear == i.CourseYearConfig.Year
                        && j.Problem == i.Id),
                })
                .OrderByDescending(i => i.CourseYear)
                    .ThenBy(i => i.CourseName)
                        .ThenBy(i => i.Since)
                            .ThenBy(i => i.Problem);
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
