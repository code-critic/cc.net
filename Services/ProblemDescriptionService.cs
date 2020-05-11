using CC.Net.Config;
using CC.Net.Services.Courses;
using Markdig;
using System.IO;
using Microsoft.Extensions.Logging;

namespace CC.Net.Services
{
    public class ProblemDescriptionService {

        private readonly AppOptions _appOptions;
        private readonly ILogger<ProblemDescriptionService> _logger;


        public ProblemDescriptionService(AppOptions appOptions, ILogger<ProblemDescriptionService> logger)
        {
            _appOptions = appOptions;
            _logger = logger;
        }

        public string GetProblemReadMe(CourseProblem problem, SingleCourse course)
        {
            var readmePath = Path.Combine(
                _appOptions.CourseDir,
                course.CourseRef.CourseDir,
                course.Year,
                "problems",
                problem.Id,
                "README.md"
            );

            if (!File.Exists(readmePath))
            {
                _logger.LogWarning("Could not find README.md {}", readmePath);
            }


            var content = File.Exists(readmePath)
                ? File.ReadAllText(readmePath)
                : "no description provided";

            return Markdown.ToHtml(content);
        }
    }
}