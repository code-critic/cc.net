using CC.Net.Config;
using CC.Net.Services.Courses;
using Markdig;
using System.IO;
using Microsoft.Extensions.Logging;
using Markdig.Renderers;
using Markdig.Parsers;
using System;
using System.Text.RegularExpressions;

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

            var pipeline = new MarkdownPipelineBuilder()
                // .UseAdvancedExtensions()
                // .UseMathematics()
                .Build();
            var writer = new StringWriter();
            var renderer = new HtmlRenderer(writer);
            renderer.LinkRewriter = arg => {
                if(arg.StartsWith("http"))
                {
                    return arg;
                }

                return $"/static-files/serve/{course.Course}/{course.Year}/{problem.Id}/{arg}";
            };

            var content = File.Exists(readmePath)
                ? File.ReadAllText(readmePath)
                : "*no description provided*";

            content = FixMathEQ(content);

            var document = MarkdownParser.Parse(content, pipeline);
            renderer.Render(document);
            writer.Flush();
            
            return writer.ToString();
        }

        private string FixMathEQ(string content)
        {
            const string MATH_FENCE_START = @"```math";
            const string MATH_FENCE_END = @"```";

            if (content.Contains(MATH_FENCE_START))
            {
                content = Regex.Replace(content, @$"({MATH_FENCE_START})(.*)({MATH_FENCE_END})", (Match match) =>
                {
                    return match.Groups[2].Value.Trim().Replace(@"\", @"\\");
                }
                , RegexOptions.IgnoreCase | RegexOptions.Singleline);
            }

            return content;
        }
    }
}