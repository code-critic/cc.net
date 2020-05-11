using CC.Net.Config;
using CC.Net.Services.Courses;
using Markdig;
using System.IO;

namespace CC.Net.Services
{
    public class ProblemDescriptionService {

        private readonly AppOptions _appOptions;


        public ProblemDescriptionService(AppOptions appOptions)
        {
            _appOptions = appOptions;
        }

        public string GetProblemReadMe(CourseProblem problem, SingleCourse course)
        {
            var readmePath = Path.Combine(
                _appOptions.CourseDir,
                course.Course,
                course.Year,
                "problems",
                problem.Id,
                "README.md"
            );

            var content = File.Exists(readmePath)
                ? File.ReadAllText(readmePath)
                : "no description provided";

            return Markdown.ToHtml(content);
        }
    }
}