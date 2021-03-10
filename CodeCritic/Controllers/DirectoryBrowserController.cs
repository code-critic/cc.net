using System;
using System.IO;
using CC.Net.Controllers.MimeTypes;
using CC.Net.Services.Courses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CC.Net.Controllers
{

    [Authorize]
    [Route("static-files")]
    public class DirectoryBrowserController : Controller
    {
        private readonly CourseService _courseService;

        public DirectoryBrowserController(CourseService courseService)
        {
            _courseService = courseService;
        }

        [HttpGet("serve/{*path}")]
        public object ServerFile(string path)
        {
            var parts = path.Split("/", 4);
            if (parts.Length != 4)
            {
                return NotFound();
            }

            try
            {
                var coursePart = parts[0];
                var yearPart = parts[1];
                var problemPart = parts[2];
                var file = parts[3];

                var course = _courseService[coursePart];
                var year = course[yearPart];
                var problem = year[problemPart];

                var problemDir = Path.Combine(course.CourseDir, year.Year, "problems", problem.Id);
                return PhysicalFile(Path.Combine(problemDir, file), MimeType.GetMimeType(file));
            }
            catch (Exception ex)
            {
                return NotFound();
            }

        }
    }
}