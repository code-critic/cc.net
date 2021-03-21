using System;
using System.Linq;
using Cc.Net;
using Cc.Net.Apis;
using cc.net.Utils;
using CC.Net.Services.Courses;
using Microsoft.AspNetCore.Mvc;

namespace CC.Net.Controllers
{
    public partial class ApiConfigController
    {
        public const string CourseListUrl = "course-list"; 
        public const string CourseProblemUrl = "course-problem"; 
    
        [HttpGet("courses")]
        [UseCache(timeToLiveSeconds: 30, perUser: true)]
        [Obsolete("User course-list")]
        public IActionResult Courses()
        {
            return Ok(_courseService.GetAllowedCoursesForUser(_userService.CurrentUser));
        }

        [HttpGet(CourseListUrl)]
        [UseCache(timeToLiveSeconds: 30, perUser: true)]
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
                        Problems = j.Problems
                    }));

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
        
        
        [HttpGet(CourseProblemUrl + "/{courseName}/{courseYear}")]
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
            };

            var problems = yearConfig
                .Problems
                .Select(i => i.AddDescription(_problemDescriptionService, singleCourse))
                .ToList();

            var response = new ApiListResponse<CourseProblem>(problems);

            return Ok(response);
        }
    }
}