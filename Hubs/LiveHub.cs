using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CC.Net.Collections;
using CC.Net.Db;
using CC.Net.Services;
using CC.Net.Services.Languages;
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

        public LiveHub(DbService dBService, IdService idService, LanguageService languageService)
        {
            _dbService = dBService;
            _idService = idService;
            _languageService = languageService;
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

        public async Task SubmitSolution(string userId, string courseName, string courseYear, string problemId, string solution, string langId, bool useDocker)
        {
            var id = Guid.NewGuid();
            var course = $"{courseName}-{courseYear}";
            var language = _languageService[langId];

            var attemptNo = 1 + await _dbService.Data
                .CountDocumentsAsync(i => i.CourseName == courseName
                    && i.CourseYear == courseYear
                    && i.User == userId
                    && i.Action == "solve"
                    && i.Problem == problemId
                );
            
            var solutions = new List<CcDataSolution>{
                CcDataSolution.Single(solution, $"main.{language.extension}")
            };

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
                    Duration = -1,
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

        public static Task OnProcessStart(this IClientProxy clients, CcData item)
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