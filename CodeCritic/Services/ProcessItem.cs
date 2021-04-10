using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using CC.Net.Collections;
using CC.Net.Config;
using CC.Net.Dto;
using Cc.Net.Extensions;
using CC.Net.Extensions;
using CC.Net.Hubs;
using CC.Net.Services.Courses;
using Cc.Net.Services.Execution;
using CC.Net.Services.Languages;
using CC.Net.Services.Matlab;
using cc.net.Services.Processing;
using Cc.Net.Services.Processing.Evaluation;
using CC.Net.Utils;
using DiffPlex;
using DiffPlex.DiffBuilder;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;

namespace CC.Net.Services
{
    public partial class ProcessItem
    {
        private readonly ILogger<ProcessItem> _logger;
        private readonly CourseService _courseService;
        private readonly LanguageService _languageService;
        private readonly IHubContext<LiveHub> _liveHub;
        private readonly CompareService _compareService;
        private readonly MatlabServer _matlabServer;
        private readonly IdService _idService;
        private readonly AppOptions _appOptions;
        private readonly EvaluationService _evaluationService;

        public CcData Item { get; set; }
        public CourseContext Context { get; set; }

        public TimeBank TimeBank { get; set; }

        public static readonly double DefaultTimeoutPerCase = 30.0;

        public static double IncreaseTimeoutForInput(double timeout)
        {
            return timeout * 20 + 10;
        }

        public ProcessItem(
            ILogger<ProcessItem> logger, CourseService courseService, LanguageService languageService,
            IdService idService, AppOptions appOptions, IHubContext<LiveHub> liveHub,
            CompareService compareService, MatlabServer matlabServer, EvaluationService evaluationService,
            CcData item)
        {
            _logger = logger;
            _courseService = courseService;
            _languageService = languageService;
            _liveHub = liveHub;
            _idService = idService;
            _appOptions = appOptions;
            _compareService = compareService;
            _matlabServer = matlabServer;
            _evaluationService = evaluationService;

            Item = item;
            Context = new CourseContext(
                _courseService,
                _languageService,
                Item
            );

            _matlabServer.Initialize(ProcessService.ContainerName);

            var timeout = Context.CourseProblem.Timeout < 1 ? DefaultTimeoutPerCase : Context.CourseProblem.Timeout;
            TimeBank = new TimeBank(
                Context.Language,
                Item.Action == "input" ? IncreaseTimeoutForInput(timeout) : timeout
            );
            Item.Result.TimeLimit = TimeBank.TimeLeft;
        }

        private void DetermineResult()
        {
            foreach (var result in Item.Results)
            {
                if (result.Status == ProcessStatus.InQueue.Value)
                {
                    result.Status = ProcessStatus.Skipped.Value;
                }
            }

            var globalResult = StatusResolver
                .DetermineResult(Item.Results);

            Item.Result.Status = globalResult.Status;
            Item.Result.Message = globalResult.Message;
            Item.Result.Messages = globalResult.Messages;
            Item.Result.Duration = Item.Results
                ?.Sum(i => i.Duration) ?? 0.0;
        }

        private async Task UpdateStatus()
        {
            var channel = _liveHub.Clients.Clients(_idService[Item.UserOrGroupUsers]);

            var scores = new int[]
            {
                Item.Results.Count(i => i.Status == ProcessStatus.AnswerCorrect.Value),
                Item.Results.Count(i => i.Status == ProcessStatus.AnswerCorrectTimeout.Value),
                Item.Results.Count(i =>
                    i.Status != ProcessStatus.AnswerCorrect.Value &&
                    i.Status != ProcessStatus.AnswerCorrectTimeout.Value),
            };
            Item.Result.Scores = scores;
            Item.Result.Score = ResultsUtils.ComputeScore(scores);

            await channel.ItemChanged(Item);
        }

        public async Task RunCasesAsync(PrepareItemResult prepareItemResult, Func<CourseProblemCase, Task> runAction)
        {
            foreach (var subtest in prepareItemResult.Problem.AllTests)
            {
                try
                {
                    var subcase = Item.Results.First(i => i.Case == subtest.Id);
                    subcase.Status = ProcessStatus.Running.Value;

                    _logger.LogInformation($"Executing: {Item} [TimeLeft: {TimeBank.TimeLeft}]", Item.ToString(subcase), TimeBank);
                    await UpdateStatus();

                    await runAction(subtest);

                    await UpdateStatus();
                    _logger.LogInformation("Case Done: {Item} in {}", Item.ToString(subcase), Item.Result.Duration);
                }
                catch (Exception e)
                {
                    _logger.LogError(e, "Error processing item: {Item}", Item.ToString(subtest.Id));

                    Item.Result.Status = ProcessStatus.ErrorWhileRunning.Value;
                    Item.Result.Message = e.Message;
                    Item.Result.Messages = e.StackTrace?.SplitLines();
                }
            }
        }

        public static ExecutionResult ExecuteCommand(ExecutionCommand command)
        {
            var sw = Stopwatch.StartNew();
            try
            {
                var args = string.Join(" ", command.AsArguments());
                var executionResult = ProcessUtils.Execute(args, command.Deadline + 10);
                executionResult.ExecutionCommand = command;
                return executionResult;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error while executing command {command.Command}: {ex}");
                return new ExecutionResult
                {
                    Code = ExecutionStatus.FatalError,
                    Status = ExecutionStatus.FatalError.ToString(),
                    Duration = sw.ElapsedMilliseconds / 1000.0,
                    Message = "Unknown error",
                    Messages = ex.StackTrace?.Split("\n").ToList() ??
                               new List<string> {"Could not determine stacktrace"},
                    ExecutionCommand = command,
                    ReturnCode = 666,
                };
            }
        }
    }
}