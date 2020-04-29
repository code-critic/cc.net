using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using CC.Net.Collections;
using CC.Net.Dto;
using CC.Net.Hubs;
using CC.Net.Services.Courses;
using CC.Net.Services.Languages;
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
        public readonly IdService _idService;

        private CcData Item { get; set; }
        private CourseContext Context { get; set; }

        private double TimeRemaining { get; set; }
        private double TimeAvailable { get; set; }


        public ProcessItem(
            ILogger<ProcessItem> logger, CourseService courseService, LanguageService languageService,
            IdService idService, IHubContext<LiveHub> liveHub, CompareService compareService, CcData item)
        {
            _logger = logger;
            _courseService = courseService;
            _languageService = languageService;
            _liveHub = liveHub;
            _idService = idService;
            _compareService = compareService;

            Item = item;
            Context = new CourseContext(
                _courseService,
                _languageService,
                Item
            );
            TimeRemaining = Math.Max(Context.CourseProblem.timeout, 30) * Context.Language.scale;
            TimeAvailable = TimeRemaining;
        }

        public ProcessResult RunPipeline(string command, string workdir, int timeout = 0, string input = null, string output = null, string error = null)
        {
            var args = "";
            args = timeout == 0 ? args : $"{args} ---t {timeout}";
            args = workdir == null ? args : $"{args} ---w {workdir}";
            args = input == null ? args : $"{args} ---i {input}";
            args = output == null ? args : $"{args} ---o {output}";
            args = error == null ? args : $"{args} ---e {error}";
            var execCmd = $"docker exec --user root {ProcessService.ContainerName} python3 /bin/run.py {args} {command}";

            var sw = new Stopwatch();
            sw.Start();
            var res = ProcessUtils.Popen(execCmd);
            sw.Stop();

            if (!res.Output.Any())
            {
                var fallBackDuration = sw.ElapsedMilliseconds / 1000.0;
                res.Output = new List<string> { "666", fallBackDuration.ToString()};
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