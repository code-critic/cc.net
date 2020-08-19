using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using CC.Net.Collections;
using CC.Net.Extensions;
using CC.Net.Hubs;
using CC.Net.Services.Courses;
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
            SolveCaseBase(@case);
        }

        private async Task GenerateInputAction(CourseProblemCase @case)
        {
            var subcase = Item.Results.First(i => i.Case == @case.Id);

            if (!@case.IsGeneretable())
            {
                subcase.Status = ProcessStatus.Skipped.Value;
                subcase.Message = "Skipping static input file";
                return;
            }

            subcase.Status = ProcessStatus.Running.Value;
            var baseCommand = $"{string.Join(" ", Context.Language.Run)}".Replace("<filename>", Context.MainFileName);
            var fullCommand = $"{baseCommand} {@case.GetArguments()}";
            var result = RunPipeline(
                fullCommand,
                Context.DockerTmpWorkdir,
                @case.Timeout < 0.01 ? 120 : (int)Math.Ceiling(@case.Timeout),
                null,
                $"output/{@case.Id}",
                $"error/{@case.Id}"
            );

            TimeRemaining -= result.Duration;
            subcase.Duration = result.Duration;
            subcase.Returncode = result.ReturnCode;
            subcase.FullCommand = result.FullCommand;
            subcase.Command = result.Command;

            CopyOutputFromDocker(@case);
            CopyErrorFromDocker(@case);
            CopyToResultDir(Context.TmpDir.OutputDir, Context.ProblemDir.InputDir, false);

            var inputFile = Context.ProblemDir.InputFile(@case.Id);

            if (result.isOk && File.Exists(inputFile))
            {
                subcase.Status = ProcessStatus.Ok.Value;
                subcase.Message = $"Input generated ({inputFile.ReadLines().Count()} lines)";
            }
            else
            {
                subcase.Status = ProcessStatus.ErrorWhileRunning.Value;
                subcase.Message = ProcessStatus.ErrorWhileRunning.Description;
                subcase.Messages = Context.GetTmpDirErrorMessage(@case.Id).SplitLines();
            }

        }
    }
}