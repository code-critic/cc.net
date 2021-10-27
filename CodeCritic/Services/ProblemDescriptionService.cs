using CC.Net.Config;
using CC.Net.Services.Courses;
using Markdig;
using System.IO;
using Microsoft.Extensions.Logging;
using Markdig.Renderers;
using Markdig.Parsers;
using System;
using System.Linq;
using System.Text.RegularExpressions;
using System.Collections.Generic;

namespace CC.Net.Services
{
    public class ProblemDescriptionService
    {

        private readonly AppOptions _appOptions;
        private readonly ILogger<ProblemDescriptionService> _logger;


        public ProblemDescriptionService(AppOptions appOptions, ILogger<ProblemDescriptionService> logger)
        {
            _appOptions = appOptions;
            _logger = logger;
        }

        public string GetProblemReadMe(CourseProblem problem, string courseDir, string course, string year)
        {
            var readmePath = Path.Combine(
                _appOptions.CourseDir,
                courseDir,
                year,
                "problems",
                problem.Id,
                "README.md"
            );

            if (!File.Exists(readmePath))
            {
                _logger.LogWarning("Could not find README.md {path}", readmePath);
                return null;
            }

            var pipeline = new MarkdownPipelineBuilder()
                // .UseAdvancedExtensions()
                // .UseMathematics()
                .Build();
            var writer = new StringWriter();
            var renderer = new HtmlRenderer(writer)
            {
                LinkRewriter = arg =>
                {
                    if (arg.StartsWith("http"))
                    {
                        return arg;
                    }

                    return $"/static-files/serve/{course}/{year}/{problem.Id}/{arg}";
                }
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
            const string mathFenceStart = @"```math";
            const string mathFenceEnd = @"```";

            if (content.Contains(mathFenceStart))
            {
                content = Regex.Replace(content, @$"({mathFenceStart})(.*)({mathFenceEnd})",
                    (Match match) => match.Groups[2].Value.Trim().Replace(@"\", @"\\"), RegexOptions.IgnoreCase | RegexOptions.Singleline);
            }

            return content;
        }

        public string GetComplexDescription(CourseProblem problem, string courseDir, string course, string year)
        {
            var candidates = new List<String> {
                Path.Combine(
                    course,
                    year,
                    "problems",
                    problem.Id,
                    "build",
                    "index.html"
                ),
                Path.Combine(
                    course,
                    year,
                    "problems",
                    problem.Id,
                    "index.html"
                ),
            };

            return candidates.FirstOrDefault(i => File.Exists(Path.Combine(_appOptions.CourseDir, i)));
        }
    }
}