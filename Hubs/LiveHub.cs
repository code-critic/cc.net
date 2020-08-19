using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using CC.Net.Collections;
using CC.Net.Db;
using CC.Net.Extensions;
using CC.Net.Services;
using CC.Net.Services.Courses;
using CC.Net.Services.Languages;
using CC.Net.Utils;
using Microsoft.AspNetCore.SignalR;
using MongoDB.Bson;
using MongoDB.Driver;
using static CC.Net.Collections.CcData;

namespace CC.Net.Hubs
{
    public class LiveHub : Hub
    {
        private readonly DbService _dbService;
        private readonly IdService _idService;
        private readonly LanguageService _languageService;
        private readonly CourseService _courseService;

        public LiveHub(DbService dBService, IdService idService, LanguageService languageService, CourseService courseService)
        {
            _dbService = dBService;
            _idService = idService;
            _languageService = languageService;
            _courseService = courseService;
        }

        public override Task OnDisconnectedAsync(Exception exception)
        {
            _idService.DeleteClient(Context.ConnectionId);
            return base.OnDisconnectedAsync(exception);
        }

        public async Task RegisterUser(string username)
        {
            _idService.SaveUser(username, Context.ConnectionId);
            Console.WriteLine(username);
        }

        public async Task GenerateInput(string userId, string courseName, string courseYear, string problemId)
        {
            await Generate(userId, courseName, courseYear, problemId, "input");
        }

        public async Task GenerateOutput(string userId, string courseName, string courseYear, string problemId)
        {
            await Generate(userId, courseName, courseYear, problemId, "output");
        }

        private async Task Generate(string userId, string courseName, string courseYear, string problemId, string action)
        {
            var id = ObjectId.GenerateNewId();
            var course = _courseService[courseName][courseYear];
            var problem = course[problemId];
            var language = _languageService[problem.Reference.Lang];

            var courseDir = _courseService[courseName].CourseDir;
            var problemDir = Path.Combine(courseDir, courseYear, "problems", problemId);

            var solutions = new List<CcDataSolution>{
                CcDataSolution.Single(
                    Path.Combine(problemDir, problem.Reference.Name).ReadAllText(),
                    problem.Reference.Name
                ),
                CcDataSolution.Single(string.Empty, $".debug", int.MaxValue, false)
            };

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
                }
            };

            _idService.RemeberClient(Clients.Caller, id);
            await Clients.Clients(_idService[ccData.User]).NotifyClient($"Job submitted");
            await _dbService.Data.InsertOneAsync(ccData);
        }

        public async Task SubmitSolution(string userId, string courseName, string courseYear, string problemId, string solution, string langId, bool useDocker)
        {
            var course = _courseService[courseName];
            var courseYearConfig = course[courseYear];
            var problem = courseYearConfig[problemId];
            var language = _languageService[langId];

            var attemptNo = 1 + await _dbService.Data
                .CountDocumentsAsync(i => i.CourseName == courseName
                    && i.CourseYear == courseYear
                    && i.User == userId
                    && i.Problem == problemId
                // && i.Action == "solve"
                );

            var solutions = new List<CcDataSolution>();

            if (problem.Unittest)
            {
                var refCode = problem.ProblemDir().RootFile(problem.Reference.Name).ReadAllText();
                solutions.Add(CcDataSolution.Single(refCode, problem.Reference.Name));
                solutions.Add(CcDataSolution.Single(solution, problem.Libname, 1, false));
                solutions.Add(CcDataSolution.Single(string.Empty, $".debug", int.MaxValue, false));
            }
            else
            {
                solutions.Add(CcDataSolution.Single(solution, $"main.{language.Extension}"));
                solutions.Add(CcDataSolution.Single(string.Empty, $".debug", int.MaxValue, false));
            }

            var attemptId = ObjectId.GenerateNewId();

            var ccData = new CcData
            {
                Id = attemptId,
                User = userId,
                CourseName = courseName,
                CourseYear = courseYear,
                Action = "solve",
                Docker = useDocker,
                Problem = problemId,
                Language = langId,
                Solutions = solutions,
                Attempt = (int)attemptNo,

                Result = new CcDataResult
                {
                    Status = ProcessStatus.InQueue.Value,
                    Duration = 0,
                    Message = null,
                    Score = 0,
                    Scores = new[] { 0, 0, 0 },
                }
            };

            _idService.RemeberClient(Clients.Caller, attemptId);
            await Clients.Clients(_idService[ccData.User]).NotifyClient($"Attempt {attemptNo} inserted into queue");
            await _dbService.Data.InsertOneAsync(ccData);
        }
    }

    public static class LiveHubExtensions
    {
        public static Task NotifyClient(this IClientProxy clients, string message, string level = "info")
        {
            try
            {
                return clients.SendAsync("OnMessage", message, level);
            }
            catch (Exception e)
            {
                Console.WriteLine(e.StackTrace);
                return Task.CompletedTask;
            }
        }

        public static Task ItemChanged(this IClientProxy clients, CcData item)
        {
            try
            {
                return clients.SendAsync("OnProcessStart", item);
            }
            catch (Exception e)
            {
                Console.WriteLine(e.StackTrace);
                return Task.CompletedTask;
            }
        }
    }
}