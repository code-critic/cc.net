using System.Linq;
using CC.Net.Services.Courses;
using CC.Net.Utils;
using Microsoft.AspNetCore.Mvc;

namespace CC.Net.Controllers
{
    [ApiController]
    [Route("webhook")]
    public class WebhookController
    {
        private readonly CourseService _courseService;
        private readonly Courses _courses;

        public WebhookController(CourseService courseService, Courses courses)
        {
            _courseService = courseService;
            _courses = courses;
        }

        [HttpPost("update")]
        [Consumes("application/x-www-form-urlencoded")]
        public object Update()
        {
            foreach (var dir in _courseService.Courses.Select(i => i.CourseDir))
            {
                var cmd = $"bash -c \"cd {dir} && git fetch --all && git reset --hard origin/master\"";
                var res = ProcessUtils.Popen(cmd, 30);
            }
            _courses.Reload();
            return _courseService.Courses.Select(i => i.CourseConfig.Name);
        }
    }
}