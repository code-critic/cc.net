using System.Collections.Generic;
using System.Linq;
using CC.Net.Attributes;
using CC.Net.Config;
using CC.Net.Db;
using Cc.Net.Dto;
using CC.Net.Services;
using CC.Net.Services.Courses;
using CC.Net.Services.Languages;
using CC.Net.Controllers.Filters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using System.Threading.Tasks;
using System;

namespace CC.Net.Controllers
{
    [ApiController]
    [Route("api")]
    [Authorize]
    public class GradeController : ControllerBase
    {
        private readonly CourseService _courseService;
        private readonly IDbService _dbService;
        private readonly UserService _userService;

        public GradeController(CourseService courseService, IDbService dbService, UserService userService)
        {
            _courseService = courseService;
            _dbService = dbService;
            _userService = userService;
        }

        [HttpPost("grade-stats/{courseName}/{year}/{problemId}")]
        [RequireRole(AppUserRoles.Root)]
        public async Task<IEnumerable<GradeDto>> GetGradeStats(string courseName, string year, string problemId, [FromBody] GradeStatFilterDto filter)
        {
            var user = _userService.CurrentUser;
            var course = _courseService.GetCourseForUser(user, courseName);
            var yearConfig = course[year];
            var visibleProblems = yearConfig.GetAllowedProblemForUser(_userService.CurrentUser);
            var problem = visibleProblems.FirstOrDefault(i => i.Id == problemId);

            if (problem == null)
            {
                return new List<GradeDto>();
            }

            var students = problem.CourseYearConfig.SettingsConfig.StudentsFor(user.Id);
            var ids = students.Select(i => i.id).ToList();
            var items = (await _dbService.Data
                    .FindAsync(i => (ids.Contains(i.User) || ids.Any(j => i.GroupUsers.Contains(i.User)))
                           && i.CourseName == course.Name
                           && i.CourseYear == yearConfig.Year
                           && i.Problem == problem.Id
                           && i.ReviewRequest != null))
                .ToList()
                .OrderByDescending(i => i.Id.CreationTime)
                .ThenByDescending(i => i.Points)
                .ThenByDescending(i => i.Result.Score)
                .ToList();

            var bestResults = new List<GradeDto>();
            foreach (var student in students)
            {
                var best = items.FirstOrDefault(i => i.User == student.id || i.GroupUsers.Contains(student.id));
                if (best == null)
                {
                    var userItems = (await _dbService.Data
                        .FindAsync(i => (ids.Contains(i.User) || ids.Any(j => i.GroupUsers.Contains(i.User)))
                                   && i.CourseName == course.Name
                                   && i.CourseYear == yearConfig.Year
                                   && i.Problem == problem.Id
                                   && i.ReviewRequest == null
                                   && (i.User == student.id || i.GroupUsers.Contains(student.id))
                                   && (i.Result.Status == (int)ProcessStatusCodes.AnswerCorrect
                                       || i.Result.Status == (int)ProcessStatusCodes.AnswerCorrectTimeout
                                       || i.Result.Status == (int)ProcessStatusCodes.AnswerWrong
                                       || i.Result.Status == (int)ProcessStatusCodes.AnswerWrongTimeout
                                   )))
                        .ToList()
                        .OrderByDescending(i => i.Points)
                        .ThenByDescending(i => i.Result.Score)
                        .ToList();
                    best = userItems.FirstOrDefault();
                }

                bestResults.Add(new GradeDto
                {
                    Result = CcDataDto.FromCcData(best ?? GradeDto.EmptyResult(course, yearConfig, problem, student)),
                    User = student
                });
            }

            return ApplyFilters(bestResults, filter);
        }

        [HttpPost("grade-stats-course/{courseName}/{year}")]
        [RequireRole(AppUserRoles.Root)]
        public async Task<IEnumerable<CourseGradeStudentDto>> GetGradeStatsCourse(string courseName, string year, [FromBody] GradeStatFilterDto filter)
        {
            var user = _userService.CurrentUser;
            var course = _courseService.GetCourseForUser(user, courseName);
            var yearConfig = course[year];

            var visibleProblems = yearConfig
                .GetAllowedProblemForUser(_userService.CurrentUser)
                .ToList();

            var students = visibleProblems
                .SelectMany(i => i.CourseYearConfig.SettingsConfig.StudentsFor(user.Id))
                .Distinct()
                .ToList();
            Console.WriteLine(students.Count);

            var ids = students
                .Select(i => i.id)
                .ToList();

            var items = (await _dbService.Data
                    .FindAsync(i => (ids.Contains(i.User) || ids.Any(j => i.GroupUsers.Contains(i.User)))
                           && i.CourseName == course.Name
                           && i.CourseYear == yearConfig.Year
                           && i.ReviewRequest != null))
                .ToList()
                .OrderByDescending(i => i.Id.CreationTime)
                .ThenByDescending(i => i.Points)
                .ThenByDescending(i => i.Result.Score)
                .ToList();


            // create combination of students and problems
            var allCombinations = students
                .SelectMany(i => visibleProblems, (student, problem) => new { student, problem })
                .ToList();

            // get best results for each combination
            var results = students
                .Select(i => new CourseGradeStudentDto {
                    User = i.id,
                    Tags = i.Tags,
                    Problems = visibleProblems.Select(p => {
                        var result = items.FirstOrDefault(k => k.UserOrGroupUsers.Contains(i.id) && k.Problem == p.Id);

                        return new CourseGradeProblemDto
                        {
                            ObjectId = result?.ObjectId,
                            Points = result?.Points ?? 0,
                            ProblemId = p.Id,
                            ProblemName = p.Name,
                            Status = (ProcessStatusCodes)(result?.Result?.Status ?? (int)ProcessStatusCodes.NoSolution),
                        };
                    }).ToList()
                });


            return results;
        }

        private IEnumerable<GradeDto> ApplyFilters(IEnumerable<GradeDto> items, GradeStatFilterDto filter)
        {
            if (filter.showMissingGradeOnly)
            {
                return items.Where(i => i.Result.ReviewRequest != null
                    && i.Result.Status != ProcessStatus.NoSolution.Letter
                    && i.Result.Points <= 0);
            }

            return items;
        }
    }
}