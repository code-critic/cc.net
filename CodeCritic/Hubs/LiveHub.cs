using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using CC.Net.Attributes;
using CC.Net.Collections;
using CC.Net.Db;
using CC.Net.Dto;
using CC.Net.Extensions;
using Cc.Net.Services;
using CC.Net.Services;
using CC.Net.Services.Courses;
using CC.Net.Services.Languages;
using CC.Net.Utils;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using MongoDB.Bson;
using MongoDB.Driver;
using static CC.Net.Collections.CcData;
using SimpleFileDto = CC.Net.Dto.SimpleFileDto;

namespace CC.Net.Hubs
{
    public class LiveHub : Hub
    {
        private readonly IDbService _dbService;
        private readonly IdService _idService;
        private readonly LanguageService _languageService;
        private readonly CourseService _courseService;
        private readonly UserService _userService;
        private readonly NotificationFlag _notificationFlag;
        private readonly SubmitSolutionService _submitSolutionService;
        private readonly ILogger<LiveHub> _logger;

        public LiveHub(IDbService dBService, IdService idService, LanguageService languageService,
            CourseService courseService, UserService userService, NotificationFlag notificationFlag,
            SubmitSolutionService submitSolutionService,
            ILogger<LiveHub> logger)
        {
            _dbService = dBService;
            _idService = idService;
            _languageService = languageService;
            _courseService = courseService;
            _userService = userService;
            _logger = logger;
            _notificationFlag = notificationFlag;
            _submitSolutionService = submitSolutionService;
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            _idService.DeleteClient(Context.ConnectionId);
            await base.OnDisconnectedAsync(exception);
        }

        public void RegisterUser(string username)
        {
            _logger.LogInformation("Hub register user: {Username}", username);
            _notificationFlag.Touch();
            _idService.SaveUser(username, Context.ConnectionId);
        }

        public async Task GenerateInput(string userId, string courseName, string courseYear, string problemId)
        {
            _userService.RequireRole<HubException>(AppUserRoles.Root);
            await Generate(userId, courseName, courseYear, problemId, "input");
        }

        public async Task GenerateOutput(string userId, string courseName, string courseYear, string problemId)
        {
            _userService.RequireRole<HubException>(AppUserRoles.Root);
            await Generate(userId, courseName, courseYear, problemId, "output");
        }

        private async Task Generate(string userId, string courseName, string courseYear, string problemId, string action)
        {
            var ccData = _submitSolutionService
                .CreateItemGenerateInputOutput(userId, courseName, courseYear, problemId, action);

            var attemptId = ccData.Id;
            var attemptNo = ccData.Attempt;

            _idService.RemeberClient(Clients.Caller, attemptId);
            await Clients.Clients(_idService[ccData.UserOrGroupUsers]).ServerMessageToClient("info", "Job submitted");
            _dbService.Data.Add(ccData);

            var itemsCount = await _dbService.Data.CountDocumentsAsync(i => i.Result.Status == ProcessStatus.InQueue.Value);
            await Clients.All.QueueStatus(new string[itemsCount]);
        }


        private async Task SubmitSolution(string userIdOrGroupId, string courseName, string courseYear, string problemId, string langId, IList<SimpleFileDto> files, string type)
        {
            var ccData = default(CcData);

            if (type == "user") {
                ccData = await _submitSolutionService
                    .CreateItemSolveStudent(userIdOrGroupId, courseName, courseYear, problemId, langId, files);
            } else {
                ccData = await _submitSolutionService
                    .CreateItemSolveGroup(userIdOrGroupId, courseName, courseYear, problemId, langId, files);
            }

            var attemptId = ccData.Id;
            var attemptNo = ccData.Attempt;

            _idService.RemeberClient(Clients.Caller, attemptId);
            await Clients.Clients(_idService[ccData.UserOrGroupUsers]).ServerMessageToClient("info", $"Attempt {attemptNo} inserted into queue");
            _dbService.Data.Add(ccData);

            var itemsCount = await _dbService.Data.CountDocumentsAsync(i => i.Result.Status == ProcessStatus.InQueue.Value);
            await Clients.All.QueueStatus(new string[itemsCount]);
        }
        
        public async Task SubmitSolutionGroup(string groupId, string courseName, string courseYear, string problemId, string langId, IList<SimpleFileDto> files)
        {
            await SubmitSolution(groupId, courseName, courseYear, problemId, langId, files, "group");
        }

        public async Task SubmitSolutionStudent(string userId, string courseName, string courseYear, string problemId, string langId, IList<SimpleFileDto> files)
        {
            await SubmitSolution(userId, courseName, courseYear, problemId, langId, files, "user");
        }
    }

    public static class LiveHubExtensions
    {
        public static Task ServerMessageToClient(this IClientProxy clients, string level, string message, string title = "", int timeOut = 1500)
        {
            try
            {
                return clients.SendAsync("serverMessage", level, message, title, timeOut);
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

        public static Task NewNotification(this IClientProxy clients, object data)
        {
            try
            {
                return clients.SendAsync("newNotification", data);
            }
            catch (Exception e)
            {
                Console.WriteLine(e.StackTrace);
                return Task.CompletedTask;
            }
        }

        public static Task QueueStatus(this IClientProxy clients, object data)
        {
            try
            {
                return clients.SendAsync("queueStatus", data);
            }
            catch (Exception e)
            {
                Console.WriteLine(e.StackTrace);
                return Task.CompletedTask;
            }
        }
    }
}