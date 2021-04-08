using System;
using System.Collections.Generic;
using System.Linq;
using Cc.Net.Apis;
using CC.Net.Config;
using CC.Net.Db;
using CC.Net.Services;
using CC.Net.Services.Courses;
using CC.Net.Services.Languages;
using Cc.Net.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace cc.net.Controllers
{
    [ApiController]
    [Route("api")]
    [Authorize]
    public class CoursesController : ControllerBase
    {
        private readonly CourseService _courseService;
        private readonly LanguageService _languageService;
        private readonly DbService _dbService;
        private readonly ProblemDescriptionService _problemDescriptionService;
        private readonly AppOptions _appOptions;
        private readonly CompareService _compareService;
        private readonly UserService _userService;
        private readonly UtilService _utilService;

        public CoursesController(
            CourseService courseService, LanguageService languageService, DbService dbService,
            ProblemDescriptionService problemDescriptionService, AppOptions appOptions,
            CompareService compareService, IHttpContextAccessor httpContextAccessor, UserService userService,
            UtilService utilService
        )
        {
            _courseService = courseService;
            _languageService = languageService;
            _dbService = dbService;
            _problemDescriptionService = problemDescriptionService;
            _appOptions = appOptions;
            _compareService = compareService;
            _userService = userService;
            _utilService = utilService;
        }

        
        [HttpGet("course-list")]
        [UseCache(timeToLiveSeconds: 30, perUser: true)]
        [ProducesResponseType(typeof(IEnumerable<SingleCourse>), StatusCodes.Status200OK)]
        public IActionResult CourseList()
        {
            var courses = _courseService
                .GetAllowedCoursesForUser(_userService.CurrentUser)
                .ToList();

            var singleCourses = courses
                .SelectMany(i => i.CourseYears
                    .Select(j => new SingleCourse
                    {
                        CourseRef = i,
                        Course = i.Name,
                        Year = j.Year,
                        CourseConfig = i.CourseConfig,
                        Problems = j.Problems,
                        SettingsConfig = j.SettingsConfig,
                    }))
                .OrderByDescending(i => i.Year)
                .ThenBy(i => i.Course);

            var response = new ApiListResponse<SingleCourse>
            {
                Data = singleCourses,
                Errors = courses
                    .Where(i => i.Errors.Any())
                    .Select(i => new ApiError
                    {
                        Name = i.Name,
                        Errors = i.Errors
                    })
            };
            return Ok(response);
        }


        [HttpGet("course-problem-list/{courseName}/{courseYear}")]
        [ProducesResponseType(typeof(IEnumerable<CourseProblem>), StatusCodes.Status200OK)]
        public IActionResult CourseProblem(string courseName, string courseYear)
        {
            var course = _courseService.GetCourseForUser(_userService.CurrentUser, courseName);
            var yearConfig = course[courseYear];

            var singleCourse = new SingleCourse
            {
                CourseRef = course,
                Course = course.Name,
                Year = yearConfig.Year,
                CourseConfig = course.CourseConfig,
                Problems = yearConfig.Problems,
                SettingsConfig = yearConfig.SettingsConfig,
            };

            var problems = yearConfig
                .Problems
                .Select(i => i.AddDescription(_problemDescriptionService, singleCourse))
                .ToList();

            problems.ForEach(i => i.UpdateRefs(yearConfig));

            var response = new ApiListResponse<CourseProblem>(problems);

            return Ok(response);
        }


        [HttpGet("test-config/{courseName}/{courseYear}")]
        [Obsolete]
        public object GetTestYaml(string courseName, string courseYear)
        {
            var course = _courseService.GetCourseForUser(_userService.CurrentUser, courseName);
            var yearConfig = course[courseYear];
            return new {data = yearConfig.Yaml};
        }
    }
}