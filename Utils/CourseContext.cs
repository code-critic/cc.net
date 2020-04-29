using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using CC.Net.Collections;
using CC.Net.Dto;
using CC.Net.Extensions;
using CC.Net.Services;
using CC.Net.Services.Courses;
using CC.Net.Services.Languages;
using DiffPlex;
using DiffPlex.DiffBuilder;

namespace CC.Net.Utils
{
    public class CourseContext
    {
        private readonly CourseService CourseService;
        private readonly LanguageService LanguageService;
        public readonly CcData Item;

        public string Id { get; set; } = Guid.Empty.ToString();

        public CourseContext(CourseService courseService, LanguageService languageService, CcData item)
        {
            CourseService = courseService;
            LanguageService = languageService;
            Item = item;
        }

        public Language Language => LanguageService[Item.Language];
        public string MainFileName => $"main.{Language.extension}";
        public string CompilationFileName => "compilation.log";

        public Course Course => CourseService[Item.CourseName];
        public CourseYearConfig CourseYear => Course[Item.CourseYear];
        public CourseProblem CourseProblem => CourseYear[Item.Problem];


        public string SolutionDir => Path.Combine(Path.GetTempPath(), "automatest", Id);
        public string SolutionCompilationFile => Path.Combine(SolutionDir, CompilationFileName);
        public string SolutionInputDir => Path.Combine(SolutionDir, "input");
        public string SolutionOutputDir => Path.Combine(SolutionDir, "output");
        public string SolutionErrorDir => Path.Combine(SolutionDir, "error");

        public string SolutionInput(string caseId) => Path.Combine(SolutionInputDir, caseId);
        public string SolutionOutput(string caseId) => Path.Combine(SolutionOutputDir, caseId);
        public string SolutionError(string caseId) => Path.Combine(SolutionErrorDir, caseId);


        public string ProblemDir => Path.Combine(Course.CourseDir, Item.CourseYear, "problems", Item.Problem);
        public string ProblemInputDir => Path.Combine(ProblemDir, "input");
        public string ProblemOutputDir => Path.Combine(ProblemDir, "output");
        public string ProblemErrorDir => Path.Combine(ProblemDir, "error");


        public string ProblemInput(string caseId) => Path.Combine(ProblemInputDir, caseId);
        public string ProblemOutput(string caseId) => Path.Combine(ProblemOutputDir, caseId);
        public string ProblemError(string caseId) => Path.Combine(ProblemErrorDir, caseId);

        public string DockerTmpWorkdir => $"/tmp/{Id}";

        public IEnumerable<string> GetSolutionErrorMessageCandidtes(string caseId, string defaultValue="Uknown error")
        {
            yield return SolutionError(caseId).ReadAllText();
            yield return SolutionOutput(caseId).ReadAllText();
            yield return defaultValue;
        }

        public string GetSolutionErrorMessage(string caseId, string defaultValue = "Uknown error")
        {
            return GetSolutionErrorMessageCandidtes(caseId, defaultValue).First(i => i != null);
        }
    }
}