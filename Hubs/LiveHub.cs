using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CC.Net.Collections;
using CC.Net.Db;
using CC.Net.Services;
using Microsoft.AspNetCore.SignalR;
using MongoDB.Bson;
using MongoDB.Driver;

namespace CC.Net.Hubs
{
    public class LiveHub : Hub
    {
        private readonly DbService _dbService;
        private readonly IdService _idService;
        private static Dictionary<ObjectId, IClientProxy> UserMap = new Dictionary<ObjectId, IClientProxy>();

        public LiveHub(DbService dBService, IdService idService)
        {
            _dbService = dBService;
            _idService = idService;
        }

        public async Task SubmitSolution(string userId, string courseName, string courseYear, string problemId, string solution, string langId, bool useDocker)
        {
            var id = Guid.NewGuid();
            var course = $"{courseName}-{courseYear}";

            var attemptNo = 1 + await _dbService.Data
                .CountDocumentsAsync(i => i.course == course
                    && i.user == userId
                    && i.action == "solve"
                    && i.problem == problemId
                );

            var attemptId = ObjectId.GenerateNewId();

            var ccData = new CcData
            {
                id = attemptId,
                user = userId,
                course = course,
                action = "solve",
                docker = useDocker,
                problem = problemId,
                lang = langId,
                solution = solution,
                attempt = (int) attemptNo,

                result = new CcDataResult
                {
                    caseId = "Result",
                    status = CCDataStatuses.InQueue,
                    duration = -1,
                    returncode = -1,
                    message = null,
                    score = 0,
                    scores = new[] { 0, 0, 0 },
                    cmd = null,
                }
            };

            _idService.RemeberClient(Clients.Caller, attemptId);

            await _dbService.Data.InsertOneAsync(ccData);
            await NotifyClient(Clients.Caller, $"Attempt {attemptNo} inserted into queue");
        }

        public static Task NotifyClient(IClientProxy client, string message, string level="info")
        {
            return client.SendAsync("OnMessage", message, level);
        }

        public static Task OnProcessStart(IClientProxy client, CcData item)
        {
            return client.SendAsync("OnProcessStart", item);
        }
    }
}