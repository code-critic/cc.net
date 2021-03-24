using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using CC.Net.Collections;
using CC.Net.Extensions;
using CC.Net.Services.Courses;
using CC.Net.Services.Languages;

namespace CC.Net.Utils
{
    public class CourseContext
    {
        private readonly CourseService CourseService;
        private readonly LanguageService LanguageService;
        public readonly CcData Item;

        private string _tmpDir { get; set; }
        public readonly FileTree TmpDir;

        private string _problemDir { get; set; }
        public readonly FileTree ProblemDir;

        private string _studentDir { get; set; }
        public readonly FileTree StudentDir;
        
        
        private string _dockerDir { get; set; }
        public readonly FileTree DockerDir;

        public string Id { get; set; }
        public readonly string CourseDir;

        public CourseContext(CourseService courseService, LanguageService languageService, CcData item, string id = null)
        : this(courseService, languageService, item, false, id)
        { }

        public CourseContext(CourseService courseService, LanguageService languageService, CcData item, bool problemDir, string id = null)
        {
            CourseService = courseService;
            LanguageService = languageService;
            Item = item;
            Id = id ?? Guid.Empty.ToString();
            CourseDir = courseService[item.CourseName].CourseDir;

            _tmpDir = Path.Combine(Path.GetTempPath(), "automatest", Id);
            _problemDir = Path.Combine(CourseDir, Item.CourseYear, "problems", Item.Problem);
            _studentDir = problemDir ? _problemDir : Item.ResultDir(CourseDir);
            _dockerDir = $"/tmp/{Id}";

            ProblemDir = new FileTree(_problemDir);
            TmpDir = new FileTree(_tmpDir);
            StudentDir = new FileTree(_studentDir);
            DockerDir = new FileTree(_dockerDir);
        }

        
    
        public Language Language => LanguageService[Item.Language];

        public string MainFileName => Item.Action == "solve"
            ? $"main.{Language.Extension}"
            : CourseProblem.Reference.Name;
        
        public static string CompilationFileName = "compilation.log";

        public Course Course => CourseService[Item.CourseName]
                                ?? throw new Exception($"Could not find course {Item.CourseName}");

        public CourseYearConfig CourseYear => Course[Item.CourseYear]
            ?? throw new Exception($"Could not find course year {Item.CourseYear}");

        public CourseProblem CourseProblem => CourseYear[Item.Problem]
            ?? throw new Exception($"Could not find problem {Item.Problem}");


        public string DockerTmpWorkdir => DockerDir.Root;

        private IEnumerable<string> GetSolutionErrorMessageCandidates(string caseId, string defaultValue = "Unknown error")
        {
            yield return TmpDir.ErrorFile(caseId).ReadAllText();
            yield return TmpDir.OutputFile(caseId).ReadAllText();
            yield return defaultValue;
        }

        public string GetTmpDirErrorMessage(string caseId, string defaultValue = "Unknown error")
        {
            return GetSolutionErrorMessageCandidates(caseId, defaultValue).First(i => i != null);
        }
    }
}