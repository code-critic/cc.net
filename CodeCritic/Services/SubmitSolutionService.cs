using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Cc.Net.Exceptions;
using Cc.Net.Services;
using CC.Net.Collections;
using CC.Net.Db;
using CC.Net.Dto;
using CC.Net.Extensions;
using CC.Net.Services;
using CC.Net.Services.Courses;
using CC.Net.Services.Languages;
using Microsoft.Extensions.Logging;
using MongoDB.Bson;
using MongoDB.Driver;
using static CC.Net.Collections.CcData;

namespace CC.Net.Services
{
    public class SubmitSolutionService
    {
        private readonly DbService _dbService;
        private readonly IdService _idService;
        private readonly LanguageService _languageService;
        private readonly CourseService _courseService;
        private readonly UserService _userService;
        private readonly NotificationFlag _notificationFlag;
        private readonly ILogger<SubmitSolutionService> _logger;

        private AppUser User => _userService.CurrentUser;

        private CourseProblem Problem(string courseName, string courseYear, string problemId)
            => _courseService[courseName][courseYear][problemId];

        public SubmitSolutionService(DbService dBService, IdService idService, LanguageService languageService,
            CourseService courseService, UserService userService, NotificationFlag notificationFlag,
            ILogger<SubmitSolutionService> logger)
        {
            _dbService = dBService;
            _idService = idService;
            _languageService = languageService;
            _courseService = courseService;
            _userService = userService;
            _logger = logger;
            _notificationFlag = notificationFlag;
        }

        public async Task<CcData> CreateItemSolveGroup(string groupId, string courseName, string courseYear, string problemId, string langId, IList<SimpleFileDto> files)
        {
            var gid = new ObjectId(groupId);
            var group = await _dbService.Groups
                .Find(i => i.Id == gid)
                .FirstAsync();

            var attemptNo = 1 + await _dbService.Data
                .CountDocumentsAsync(i => i.GroupId == group.Id
                    && i.CourseName == courseName
                    && i.CourseYear == courseYear
                    && i.Problem == problemId
                );

            var template = CreateItemTemplate(courseName, courseYear, problemId, langId, files);

            template.User = null;
            template.GroupId = group.Id;
            template.GroupName = group.Name;
            template.GroupUsers = group.Users.Select(i => i.Name).ToList();
            template.Attempt = (int)attemptNo;

            return template;
        }

        public async Task<CcData> CreateItemSolveStudent(string userId, string courseName, string courseYear, string problemId, string langId, IList<SimpleFileDto> files)
        {
            var attemptNo = 1 + await _dbService.Data
                .CountDocumentsAsync(i => i.User == userId
                    && i.CourseName == courseName
                    && i.CourseYear == courseYear
                    && i.Problem == problemId
                );

            var template = CreateItemTemplate(courseName, courseYear, problemId, langId, files);

            template.User = userId;
            template.Attempt = (int)attemptNo;

            return template;
        }


        private CcData CreateItemTemplate(string courseName, string courseYear, string problemId, string langId, IList<SimpleFileDto> files)
        {
            var id = ObjectId.GenerateNewId();
            var problem = Problem(courseName, courseYear, problemId);
            var language = _languageService[langId];
            var solutions = new List<CcDataSolution>();

            if (problem.Type == ProblemType.Unittest)
            {
                var refCode = problem.ProblemDir().RootFile(problem.Reference.Name).ReadAllText();
                solutions.Add(CcDataSolution.Single(refCode, problem.Reference.Name, 2, false, problem.Reference.Hidden));
                solutions.AddRange(files.Select(i => CcDataSolution.Single(i.Content, i.Path)));
            }
            else
            {
                // add all files
                solutions.AddRange(files.Select(i => CcDataSolution.Single(i.Content, i.Path)));
            }
            
            // add other required files
            solutions.AddRange(language.Files.Select(i => 
                CcDataSolution.Single(i.Values.First(), i.Keys.First(), 9, false, true)));

            var ccData = new CcData
            {
                Id = id,
                CourseName = courseName,
                CourseYear = courseYear,
                Action = "solve",
                Docker = true,
                Problem = problemId,
                Language = langId,
                Solutions = solutions,

                Result = new CcDataResult
                {
                    Status = ProcessStatus.InQueue.Value,
                    Duration = 0,
                    Message = null,
                    Score = 0,
                    Scores = new[] { 0, 0, 0 },
                },
                SubmissionStatus =
                    DateTime.Now <= problem.Avail
                        ? SubmissionStatus.Intime
                        : DateTime.Now <= problem.Deadline
                            ? SubmissionStatus.Late
                            : SubmissionStatus.None,
            };

            return ccData;
        }

        public CcData CreateItemGenerateInputOutput(string userId, string courseName, string courseYear, string problemId, string action)
        {
            if (User.Role != AppUserRoles.Root)
            {
                throw new PermissionDeniedException();
            }

            var id = ObjectId.GenerateNewId();
            var problem = Problem(courseName, courseYear, problemId);
            var language = _languageService[problem.Reference.Lang];

            var courseDir = _courseService[courseName].CourseDir;
            var problemDir = Path.Combine(courseDir, courseYear, "problems", problemId);

            var solutions = new List<CcDataSolution>{
                CcDataSolution.Single(
                    Path.Combine(problemDir, problem.Reference.Name).ReadAllText(),
                    problem.Reference.Name
                ),
                CcDataSolution.Single(string.Empty, ".debug", int.MaxValue, false)
            };
                        
            // add other required files
            solutions.AddRange(language.Files.Select(i => 
                CcDataSolution.Single(i.Values.First(), i.Keys.First(), 9, false, true)));

            var ccData = new CcData
            {
                Id = id,
                User = userId,
                CourseName = courseName,
                CourseYear = courseYear,
                Problem = problemId,
                Action = action,
                Language = language.Id,
                Solutions = solutions,
                Result = new CcDataResult
                {
                    Status = ProcessStatus.InQueue.Value,
                    Duration = 0,
                    Message = null,
                    Score = 0,
                    Scores = new[] { 0, 0, 0 },
                },
                SubmissionStatus =
                    DateTime.Now <= problem.Avail
                        ? SubmissionStatus.Intime
                        : DateTime.Now <= problem.Deadline
                            ? SubmissionStatus.Late
                            : SubmissionStatus.None,
            };

            return ccData;
        }
    }
}