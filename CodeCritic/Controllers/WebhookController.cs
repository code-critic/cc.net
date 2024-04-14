using System.Linq;
using CC.Net.Services.Courses;
using CC.Net.Utils;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace CC.Net.Controllers
{
    [ApiController]
    [Route("webhook")]
    public class WebhookController
    {
        private readonly CourseService _courseService;
        private readonly Courses _courses;
        private readonly ILogger<WebhookController> _logger;

        public WebhookController(CourseService courseService, Courses courses, ILogger<WebhookController> logger)
        {
            _courseService = courseService;
            _courses = courses;
            _logger = logger;
        }

        [HttpPost("update")]
        [Consumes("application/x-www-form-urlencoded")]
        public object Update()
        {
            foreach (var dir in _courseService.Courses.Select(i => i.CourseDir))
            {
                var cmd = $"bash -c \"cd {dir} && git fetch --all && git reset --hard origin/master\"";
                _logger.LogInformation("Running: {Cmd}", cmd);
                var res = ProcessUtils.Popen(cmd, 30);
                _logger.LogInformation("Result: {Info}, \n################### Output:\n {OutputLines} \n################### Error:\n {ErrorLines}", res.ToString(), string.Join("\n", res.Output), string.Join("\n", res.Error));
            }
            _courses.Reload();
            return _courseService.Courses.Select(i => i.CourseConfig.Name);
        }
    }
}