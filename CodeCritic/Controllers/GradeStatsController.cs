using System.Collections.Generic;
using System.Linq;
using CC.Net.Attributes;
using CC.Net.Config;
using CC.Net.Db;
using Cc.Net.Dto;
using CC.Net.Services;
using CC.Net.Services.Courses;
using CC.Net.Services.Languages;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace CC.Net.Controllers
{
    [ApiController]
    [Route("api")]
    [Authorize]
    public class GradeController: ControllerBase
    {
        private readonly CourseService _courseService;
        private readonly DbService _dbService;
        private readonly UserService _userService;

        public GradeController(CourseService courseService,  DbService dbService,UserService userService)
        {
            _courseService = courseService;
            _dbService = dbService;
            _userService = userService;
        }

        [HttpGet("grade-stats/{courseName}/{year}/{problemId}")]
        [RequireRole(AppUserRoles.Root)]
        public List<GradeDto> GetGradeStats(string courseName, string year, string problemId)
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
            var items = _dbService.Data
                .Find(i => (ids.Contains(i.User) || ids.Any(j => i.GroupUsers.Contains(i.User)))
                           && i.CourseName == course.Name
                           && i.CourseYear == yearConfig.Year
                           && i.Problem == problem.Id
                           && i.ReviewRequest != null)
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
                    var userItems = _dbService.Data
                        .Find(i => (ids.Contains(i.User) || ids.Any(j => i.GroupUsers.Contains(i.User)))
                                   && i.CourseName == course.Name
                                   && i.CourseYear == yearConfig.Year
                                   && i.Problem == problem.Id
                                   && i.ReviewRequest == null
                                   && (i.User == student.id || i.GroupUsers.Contains(student.id))
                                   && (i.Result.Status == (int) ProcessStatusCodes.AnswerCorrect
                                       || i.Result.Status == (int) ProcessStatusCodes.AnswerCorrectTimeout
                                       || i.Result.Status == (int) ProcessStatusCodes.AnswerWrong
                                       || i.Result.Status == (int) ProcessStatusCodes.AnswerWrongTimeout
                                   ))
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

            return bestResults;
        }
    }
}