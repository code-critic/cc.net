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
        private readonly Courses _courses;

        public CoursesController(
            CourseService courseService, LanguageService languageService, DbService dbService,
            ProblemDescriptionService problemDescriptionService, AppOptions appOptions,
            CompareService compareService, IHttpContextAccessor httpContextAccessor, UserService userService,
            UtilService utilService, Courses courses)
        {
            _courseService = courseService;
            _languageService = languageService;
            _dbService = dbService;
            _problemDescriptionService = problemDescriptionService;
            _appOptions = appOptions;
            _compareService = compareService;
            _userService = userService;
            _utilService = utilService;
            _courses = courses;
        }

        
        // -------------------------------------------------------------------------------------------------------------
        
        [HttpGet("user-courses")]
        [UseCache(timeToLiveSeconds: 30, perUser: true)]
        [ProducesResponseType(typeof(ApiListResponse<CourseConfigDto>), StatusCodes.Status200OK)]
        [Obsolete]
        public IActionResult CoursesUser()
        {
            var user = _userService.CurrentUser;
            var result = _courses.ForUser(user);
            return Ok(new ApiListResponse<CourseConfigDto>(result));
        }
        
        [HttpGet("user-problems/{courseName}/{courseYear}")]
        [UseCache(timeToLiveSeconds: 30, perUser: true)]
        [ProducesResponseType(typeof(List<ProblemDto>), StatusCodes.Status200OK)]
        public IActionResult UserProblem(string courseName, string courseYear)
        {
            var user = _userService.CurrentUser;
            var result = _courses.GetProblems(courseName, courseYear, user);
            return Ok(result);
        }
        
        [HttpGet("user-problem/{courseName}/{courseYear}/{problem}")]
        [UseCache(timeToLiveSeconds: 30, perUser: true)]
        [ProducesResponseType(typeof(ProblemDto), StatusCodes.Status200OK)]
        public IActionResult UserSingleProblem(string courseName, string courseYear, string problem)
        {
            var user = _userService.CurrentUser;
            var result = _courses.GetProblem(courseName, courseYear, problem, user);
            var course = result.CourseYearDto().CourseConfigDto();
            
            if (string.IsNullOrEmpty(result.Config.Description))
            {
                result.Config.Description = _problemDescriptionService
                    .GetProblemReadMe(result.Config, course.CourseDir, result.Course, result.Year);
            }
            return Ok(result.IncludeDescription());
        }
        
        // -------------------------------------------------------------------------------------------------------------
        
        [HttpGet("course-list")]
        [UseCache(timeToLiveSeconds: 30, perUser: true)]
        [ProducesResponseType(typeof(ApiListResponse<SingleCourse>), StatusCodes.Status200OK)]
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
        [ProducesResponseType(typeof(ApiListResponse<CourseProblem>), StatusCodes.Status200OK)]
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

            yearConfig.Problems.ForEach(i => i.AddDescription(_problemDescriptionService, singleCourse));
            yearConfig.Problems.ForEach(i => i.UpdateRefs(yearConfig));

            var response = new ApiListResponse<CourseProblem>(yearConfig.Problems);

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