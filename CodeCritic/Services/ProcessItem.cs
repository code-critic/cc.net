using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CC.Net.Collections;
using CC.Net.Config;
using CC.Net.Dto;
using CC.Net.Extensions;
using CC.Net.Hubs;
using CC.Net.Services.Courses;
using CC.Net.Services.Languages;
using CC.Net.Services.Matlab;
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

        private CcData Item { get; set; }
        private CourseContext Context { get; set; }

        private double TimeRemaining { get; set; }
        private double TimeAvailable { get; set; }

        public static double IncreaseTimeoutForInput(double timeout)
        {
            return timeout * 20 + 10;
        }


        public ProcessItem(
            ILogger<ProcessItem> logger, CourseService courseService, LanguageService languageService,
            IdService idService, AppOptions appOptions, IHubContext<LiveHub> liveHub, 
            CompareService compareService, MatlabServer matlabServer, CcData item)
        {
            _logger = logger;
            _courseService = courseService;
            _languageService = languageService;
            _liveHub = liveHub;
            _idService = idService;
            _appOptions = appOptions;
            _compareService = compareService;
            _matlabServer = matlabServer;
            
            Item = item;
            Context = new CourseContext(
                _courseService,
                _languageService,
                Item
            );

            _matlabServer.Initialize(ProcessService.ContainerName);

            var timeout = Context.CourseProblem.Timeout;
            TimeRemaining = (timeout < 1 ? 30 : timeout) * Context.Language.ScaleFactor;
            TimeAvailable = TimeRemaining;

            if (Item.Action == "input")
            {
                TimeRemaining = IncreaseTimeoutForInput(TimeRemaining);
                TimeAvailable = TimeRemaining;
            }
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
                Item.Results.Count(i => i.Status != ProcessStatus.AnswerCorrect.Value && i.Status != ProcessStatus.AnswerCorrectTimeout.Value),
            };
            Item.Result.Scores = scores;
            Item.Result.Score =  ResultsUtils.ComputeScore(scores);

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

                    _logger.LogInformation("Executing: {Item}", Item.ToString(subcase));
                    await UpdateStatus();

                    await runAction(subtest);

                    await UpdateStatus();
                    _logger.LogInformation("Case Done: {Item}", Item.ToString(subcase));
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

        public static ProcessResult RunPipeline(string command, string workdir, int timeout = 0, string input = null, string output = null, string error = null)
        {
            var args = new StringBuilder();
            if (timeout > 0) args.Append($" ---t {timeout}");
            if (workdir != null ) args.Append($" ---w {workdir}");
            if (input != null ) args.Append($" ---i {input}");
            if (output != null ) args.Append($" ---o {output}");
            if (error != null ) args.Append($" ---e {error}");
            
            var execCmd = $"docker exec --user jan-hybs {ProcessService.ContainerName} python3 /bin/run.py {args} {command}";
            
            var sw = new Stopwatch();
            sw.Start();
            var res = ProcessUtils.Popen(execCmd);
            sw.Stop();

            if (!res.Output.Any())
            {
                var fallBackDuration = sw.ElapsedMilliseconds / 1000.0;
                res.Output = new List<string> { "666", fallBackDuration.ToString() };
            }

            var returncode = int.Parse(res.Output[0]);
            var duration = double.Parse(res.Output[1]);

            return new ProcessResult
            {
                InputFile = input,
                OutputFile = output,
                ErrorFile = error,
                Workdir = workdir,
                Timeout = timeout,

                Duration = duration,
                ReturnCode = returncode,
                Command = command,
                FullCommand = execCmd,
            };
        }
    }
}