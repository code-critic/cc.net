using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using CC.Net.Collections;
using CC.Net.Dto.UnitTest;
using Cc.Net.Extensions;
using CC.Net.Extensions;
using CC.Net.Hubs;
using CC.Net.Services.Courses;
using Cc.Net.Services.Execution;
using CC.Net.Services.Languages;
using CC.Net.Utils;
using Microsoft.Extensions.Logging;

namespace CC.Net.Services
{
    public partial class ProcessItem
    {
        public async Task<CcData> Solve()
        {
            var prepareResult = await PrepareItem();
            if (prepareResult.Failed)
            {
                return Item;
            }

            // solve all cases
            await RunCasesAsync(prepareResult, SolveCaseAsync);

            DetermineResult();
            CopyToResultDir();

            await prepareResult.Channel.ItemChanged(Item);
            return Item;
        }

        private void CopyToResultDir(string sourceDir, string targetDir, bool ensuryEmpty = true)
        {
            if (ensuryEmpty)
            {
                if (Directory.Exists(targetDir))
                {
                    Directory.Delete(targetDir, true);
                }
            }

            if (!Directory.Exists(targetDir))
            {
                Directory.CreateDirectory(targetDir);
            }

            DirectoryUtils.Copy(
                sourceDir,
                targetDir
            );
        }

        private void CopyToResultDir(bool ensureEmpty = true)
        {
            var targetDir = Item.ResultDir(Context.CourseDir);
            var sourceDir = Context.TmpDir.Root;

            CopyToResultDir(sourceDir, targetDir, ensureEmpty);
        }


        private async Task<ExecutionResult> SolveCaseBaseAsync(CourseProblemCase @case)
        {
            var caseId = @case.Id;
            var subcase = Item.Results.First(i => i.Case == caseId);

            // skip global timeouts
            if (TimeBank.IsBusted())
            {
                subcase.SetStatus(ProcessStatus.Skipped);
                subcase.TimeLimit = 0;
                subcase.Messages = new[] {"No time left"};
                return new ExecutionResult
                {
                    Code = ExecutionStatus.GlobalTimeout,
                    Status = ExecutionStatus.GlobalTimeout.ToString(),
                    Duration = 0,
                    ReturnCode = -1,
                };
            }

            // copy test assets
            CopyInDocker($"assets/{caseId}/*");

            subcase.Status = ProcessStatus.Running.Value;
            subcase.TimeLimit = @case.Timeout.ScaleTo(Context.Language);
            
            var language = Context.Language;
            var isUnitTest = Context.CourseProblem.Type == ProblemType.Unittest;
            var pipeline = isUnitTest && language.Unittest.Any()
                ? language.Unittest
                : language.Run;


            SetPermissions();
            var executionResult = ExecuteCommand(new ExecutionCommand
            {
                Command = $"{string.Join(" ", pipeline)}".ReplaceCommon(Context.MainFileName),
                Workdir = Context.DockerTmpWorkdir,
                Timeout = @case.Timeout.ScaleTo(language),
                Deadline = TimeBank.TimeLeft,
                IPath = isUnitTest ? null : $"input/{@case.Id}",
                OPath = $"output/{@case.Id}",
                EPath = $"error/{@case.Id}"
            });
            
            
            CopyOutputFromDocker(@case);
            CopyErrorFromDocker(@case);
            CopyFromDocker(".report.json");
            CopyFromDocker(".report.simple.json");
            foreach (var f in Context.CourseProblem.Export)
            {
                CopyFromDocker(f);
            }
            
            // determine messages and statuses
            _evaluationService.EvaluateTypeSolve(executionResult, this, @case);
            return executionResult;
        }

        private void SetPermissions()
        {
            ProcessUtils.Popen(
                $"docker exec --user root {ProcessService.ContainerName} chmod -R 777 {Context.DockerTmpWorkdir}");
        }

        private async Task SolveCaseAsync(CourseProblemCase @case)
        {
            var result = await SolveCaseBaseAsync(@case);
            if (result.IsBroken)
            {
                return;
            }

            switch (Context.CourseProblem.Type)
            {
                case ProblemType.Unittest:
                    HandleTypeUnittest(@case, result);
                    return;
                case ProblemType.LineByLine:
                    HandleTypeLineByLine(@case, result);
                    return;
                case ProblemType.Program:
                    HandleTypeProgram(@case, result);
                    return;
                default:
                    throw new ArgumentOutOfRangeException(nameof(ProblemType));
            }
        }

        private void HandleTypeProgram(CourseProblemCase @case, ExecutionResult result)
        {
            var caseResult = Item.Results.First(i => i.Case == @case.Id);

            // reference solution
            var reference = Context.CourseProblem.Reference;
            var refLanguage = _languageService[reference.Lang];
            var args = new List<string>
            {
                "-v",
                "-i", Context.DockerDir.InputFile(@case.Id),
                "-o", Context.DockerDir.OutputFile(@case.Id),
            };

            var pipeline = new List<string>()
                .Concat(refLanguage.Run)
                .Concat(args)
                .ToList();

            var verifyResult = ExecuteCommand(new ExecutionCommand
            {
                Command = $"{string.Join(" ", pipeline)}".ReplaceCommon(reference.Name),
                Workdir = Context.DockerDir.VerificationDir,
                OPath = $"{@case.Id}.o",
                EPath = $"{@case.Id}.e",
            });
            

            if (verifyResult.IsBroken)
            {
                // copy files from tmp
                CopyVerificationFromDocker(@case);
                
                var output = File.ReadAllText($"{Context.TmpDir.VerificationDir}/{@case.Id}.o").Trim();
                var error = File.ReadAllText($"{Context.TmpDir.VerificationDir}/{@case.Id}.e").Trim();
                var messages = new List<string>
                    {
                        "Verification failed:"
                    }
                    .Concat(output.SplitLines())
                    .Concat(error.SplitLines())
                    .Where(i => !string.IsNullOrEmpty(i))
                    .ToList();
                
                caseResult.Status = ProcessStatus.AnswerWrong.Value;
                caseResult.Message = ProcessStatus.AnswerWrong.Description;
                caseResult.Messages = messages.ToArray();
            }
            else
            {
                caseResult.Status = ProcessStatus.AnswerCorrect.Value;
                caseResult.Message = ProcessStatus.AnswerCorrect.Description;
            }
        }

        private void HandleTypeLineByLine(CourseProblemCase @case, ExecutionResult result)
        {
            var caseResult = Item.Results.First(i => i.Case == @case.Id);
            var referenceFile = Context.ProblemDir.OutputFile(@case.Id);
            
            if (!File.Exists(referenceFile))
            {
                caseResult.SetStatus(ProcessStatus.Skipped);
                caseResult.Message = "Reference file is missing";
                caseResult.Messages = new []
                {
                    $"File {referenceFile} does not exists, contact the administrator or a teacher."
                };
                return;
            }

            var diffResult = _compareService.CompareFiles(Context, @case);

            if (diffResult.isOk)
            {
                caseResult.SetStatus(result.IsTimeOuted
                    ? ProcessStatus.AnswerCorrectTimeout
                    : ProcessStatus.AnswerCorrect);
            }
            else
            {
                caseResult.SetStatus(result.IsTimeOuted
                    ? ProcessStatus.AnswerWrongTimeout
                    : ProcessStatus.AnswerWrong);
            }
        }

        private void HandleTypeUnittest(CourseProblemCase @case, ExecutionResult result)
        {
            var caseResult = Item.Results.First(i => i.Case == @case.Id);
            var errorText = Context.TmpDir.ErrorFile(@case.Id).ReadAllText();
            
            if (string.IsNullOrEmpty(errorText))
            {
                if (result.IsTimeOuted)
                {
                    caseResult.Status = ProcessStatus.AnswerCorrectTimeout.Value;
                    caseResult.Message = ProcessStatus.AnswerCorrectTimeout.Description;
                }
                else
                {
                    caseResult.Status = ProcessStatus.AnswerCorrect.Value;
                    caseResult.Message = ProcessStatus.AnswerCorrect.Description;
                }
            }
            else
            {
                caseResult.Status = ProcessStatus.AnswerWrong.Value;
                caseResult.Message = ProcessStatus.AnswerWrong.Description;
                caseResult.Messages = errorText.SplitLines();
            }
        }
    }
}