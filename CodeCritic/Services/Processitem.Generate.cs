using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using CC.Net.Collections;
using Cc.Net.Extensions;
using CC.Net.Extensions;
using CC.Net.Hubs;
using CC.Net.Services.Courses;
using Cc.Net.Services.Execution;
using CC.Net.Utils;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;

namespace CC.Net.Services
{
    public partial class ProcessItem
    {
        public async Task<CcData> GenerateInput()
        {
            var prepareResult = await PrepareItem();
            if (prepareResult.Failed)
            {
                return Item;
            }

            // solve all cases
            await RunCasesAsync(prepareResult, GenerateInputAction);

            DetermineResult();
            CopyToResultDir(Context.TmpDir.OutputDir, Context.ProblemDir.InputDir, false);

            await prepareResult.Channel.ItemChanged(Item);
            return Item;
        }

        public async Task<CcData> GenerateOutput()
        {
            var prepareResult = await PrepareItem();
            if (prepareResult.Failed)
            {
                return Item;
            }

            // solve all cases
            await RunCasesAsync(prepareResult, GenerateOutputAction);

            DetermineResult();
            CopyToResultDir(Context.TmpDir.OutputDir, Context.ProblemDir.OutputDir, false);

            await prepareResult.Channel.ItemChanged(Item);
            return Item;
        }

        private async Task GenerateOutputAction(CourseProblemCase @case)
        {
            await SolveCaseBaseAsync(@case);
        }

        private async Task GenerateInputAction(CourseProblemCase @case)
        {
            var subcase = Item.Results.First(i => i.Case == @case.Id);

            if (!@case.IsGeneretable())
            {
                subcase.Status = ProcessStatus.Skipped.Value;
                subcase.Message = "Skipping static input file";
                subcase.TimeLimit = 0;
                return;
            }

            // skip global timeouts
            if (TimeBank.IsBusted())
            {
                subcase.SetStatus(ProcessStatus.Skipped);
                subcase.Messages = new[] {"No time left"};
                subcase.TimeLimit = 0;
                return;
            }

            subcase.Status = ProcessStatus.Running.Value;
            subcase.TimeLimit = @case.Timeout.ScaleTo(Context.Language);
            
            var baseCommand = $"{string.Join(" ", Context.Language.Run)}".ReplaceCommon(Context.MainFileName);
            var fullCommand = $"{baseCommand} {@case.GetArguments()}";
            var generateResult = ExecuteCommand(new ExecutionCommand
            {
                Command = fullCommand,
                Workdir = Context.DockerTmpWorkdir,
                Timeout = @case.Timeout.ScaleTo(Context.Language),
                Deadline = TimeBank.TimeLeft,
                OPath = $"output/{@case.Id}",
                EPath = $"error/{@case.Id}",
            });

            CopyOutputFromDocker(@case);
            CopyErrorFromDocker(@case);
            CopyToResultDir(Context.TmpDir.OutputDir, Context.ProblemDir.InputDir, false);

            _evaluationService.EvaluateTypeGenerate(generateResult, this, @case);
        }
    }
}