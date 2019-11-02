using System.Collections.Generic;
using CC.Net.Services.Courses;
using CC.Net.Services.Languages;
using Microsoft.AspNetCore.Mvc;

namespace CC.Net.Controllers
{
    [ApiController]
    [Route("api")]
    public class ApiConfigController
    {
        private readonly CourseService _courseService;
        private readonly LanguageService _languageService;

        public ApiConfigController(CourseService courseService, LanguageService languageService)
        {
            _courseService = courseService;
            _languageService = languageService;
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
    }
}