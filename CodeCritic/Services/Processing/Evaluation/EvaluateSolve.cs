using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using CC.Net.Collections;
using CC.Net.Dto.UnitTest;
using CC.Net.Extensions;
using CC.Net.Services;
using CC.Net.Services.Courses;
using Cc.Net.Services.Execution;
using CC.Net.Services.Languages;
using Microsoft.Extensions.Logging;

namespace Cc.Net.Services.Processing.Evaluation
{
    public class EvaluationService
    {
        public ILogger<EvaluationService> _logger;

        public EvaluationService(ILogger<EvaluationService> logger)
        {
            _logger = logger;
        }

        public void EvaluateTypeGenerate(ExecutionResult executionResult, ProcessItem processItem, CourseProblemCase @case)
        {
            var context = processItem.Context;
            var ccData = processItem.Item;
            var subcase = ccData.Results.First(i => i.Case == @case.Id);
            
            subcase.Duration = executionResult.Duration;
            subcase.Returncode = executionResult.ReturnCode;
            subcase.FullCommand = executionResult.ExecutionCommand.FullCmd;
            subcase.Command = executionResult.ExecutionCommand.Command;
            processItem.TimeBank.WallTime += executionResult.Duration;
            
            var inputFile = context.ProblemDir.InputFile(@case.Id);

            switch (executionResult.Code)
            {
                case ExecutionStatus.Ok:
                case ExecutionStatus.OkTimeout:
                    if (File.Exists(inputFile))
                    {
                        subcase.SetStatus(ProcessStatus.Ok);
                        subcase.Message = $"Input file generated: ({new FileInfo(inputFile).Length} bytes)";
                        return;
                    }
                    subcase.SetStatus(ProcessStatus.ErrorWhileRunning);
                    subcase.Message = "Program ended with 0 but no input file was generated";
                    return;
                
                case ExecutionStatus.GlobalTimeout:
                    subcase.SetStatus(ProcessStatus.GlobalTimeout);
                    subcase.Messages = new List<string>()
                        .Concat(executionResult.Messages?.ToArray() ?? new string[]{ })
                        .Concat(context.GetTmpDirErrorMessage(@case.Id).SplitLines())
                        .ToArray();
                    return;
                
                case ExecutionStatus.Error:
                case ExecutionStatus.ErrorTimeout:
                case ExecutionStatus.FatalError:
                case ExecutionStatus.NoSuchFile:
                    subcase.SetStatus(ProcessStatus.ErrorWhileRunning);
                    subcase.Message = $"[{executionResult.Status}] {executionResult.Message}";
                    subcase.Messages = new List<string>()
                        .Concat(executionResult.Messages?.ToArray() ?? new string[]{ })
                        .Concat(context.GetTmpDirErrorMessage(@case.Id).SplitLines())
                        .ToArray();
                    return;
                
                default:
                    throw new Exception(
                        $"Fatal exception when evaluating result, unknown execution status ${executionResult.Code}");
            }
        }
        public void EvaluateTypeSolve(ExecutionResult executionResult, ProcessItem processItem, CourseProblemCase @case)
        {
            var context = processItem.Context;
            var ccData = processItem.Item;
            var subcase = ccData.Results.First(i => i.Case == @case.Id);

            subcase.Duration = executionResult.Duration;
            subcase.Returncode = executionResult.ReturnCode;
            subcase.FullCommand = executionResult.ExecutionCommand.FullCmd;
            subcase.Command = executionResult.ExecutionCommand.Command;
            processItem.TimeBank.WallTime += executionResult.Duration;

            var reportJson = context.TmpDir.RootFile(".report.json");
            if (File.Exists(reportJson))
            {
                var report = PythonReport.FromJson(reportJson.ReadAllText());
                ccData.Results.AddRange(
                    report.Report.Tests.Select(i => new CcDataCaseResult
                    {
                        Case = i.Name,
                        Duration = i.Duration,
                        Status = i.Outcome == "passed"
                            ? (int) ProcessStatusCodes.AnswerCorrect
                            : (int) ProcessStatusCodes.AnswerWrong
                    })
                );
            }
            
            FillBasicInfo(executionResult, processItem, @case);
        }
        
        private void FillBasicInfo(ExecutionResult executionResult, ProcessItem processItem, CourseProblemCase @case)
        {
            var language = processItem.Context.Language;
            var subcase = processItem.Item.Results.First(i => i.Case == @case.Id);
            
            switch (executionResult.Code)
            {
                case ExecutionStatus.Ok:
                    subcase.SetStatus(ProcessStatus.Ok);
                    return;
                
                case ExecutionStatus.OkTimeout:
                    subcase.SetStatus(ProcessStatus.Ok);
                    subcase.Messages = executionResult
                        .CreateTimeoutMessages(@case.Timeout, language)
                        .ToArray();
                    return;
                
                case ExecutionStatus.GlobalTimeout:
                    subcase.SetStatus(ProcessStatus.GlobalTimeout);
                    subcase.Messages = executionResult
                        .CreateDeadlineMessages(processItem.TimeBank)
                        .ToArray();
                    return;
                
                case ExecutionStatus.NoSuchFile:
                    subcase.SetStatus(ProcessStatus.ErrorWhileRunning);
                    subcase.Messages = new List<string>
                            {"Error while starting the process (no such file)", executionResult.Message}
                        .ToArray();
                    return;
                
                case ExecutionStatus.ErrorTimeout:
                    subcase.SetStatus(ProcessStatus.ErrorWhileRunning);
                    subcase.Message = executionResult.Message;
                    subcase.Messages = new List<string>()
                        .Concat(executionResult.Messages)
                        .Concat(new[] {"----", "Also, program did not finish in time"})
                        .Concat(executionResult.CreateTimeoutMessages(@case.Timeout, language))
                        .ToArray();
                    return;
                
                case ExecutionStatus.Error:
                case ExecutionStatus.FatalError:
                    subcase.SetStatus(ProcessStatus.ErrorWhileRunning);
                    subcase.Message = executionResult.Message;
                    subcase.Messages = executionResult.Messages?.ToArray();
                    return;
                
                default:
                    throw new Exception(
                        $"Fatal exception when evaluating result, unknown execution status ${executionResult.Code}");
            }
        }
    }
}