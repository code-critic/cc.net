using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using CC.Net.Collections;
using CC.Net.Dto.UnitTest;
using CC.Net.Extensions;
using CC.Net.Hubs;
using CC.Net.Services.Courses;
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


        private async Task<ProcessResult> SolveCaseBaseAsync(CourseProblemCase @case)
        {
            var caseId = @case.Id;
            var subcase = Item.Results.First(i => i.Case == caseId);
            var timeout = @case.Timeout < 0.001 ? 5 : @case.Timeout;
            var language = Context.Language;

            // ran out of time
            if (TimeRemaining < 0)
            {
                subcase.Status = ProcessStatus.Skipped.Value;
                subcase.Message = "Ran out of time";
                return new ProcessResult
                {
                    ReturnCode = 666
                };
            }

            // copy test assets
            CopyInDocker($"assets/{caseId}/*");


            subcase.Status = ProcessStatus.Running.Value;
            var isUnitTest = Context.CourseProblem.Type == ProblemType.Unittest;
            var filename = isUnitTest || Context.Item.Action == "output"
                ? Context.CourseProblem.Reference.Name
                : Context.MainFileName;

            var pipeline = isUnitTest && language.Unittest.Any()
                ? language.Unittest
                : language.Run;


            SetPermissions();
            var result = RunPipeline(
                $"{string.Join(" ", pipeline)}".ReplaceCommon(filename),
                Context.DockerTmpWorkdir,
                (int)Math.Ceiling(TimeRemaining),
                isUnitTest ? null : $"input/{@case.Id}",
                $"output/{@case.Id}",
                $"error/{@case.Id}"
            );

            // ProcessResult result;
            // if (Context.Language.Id.ToLower() == "matlab")
            // {
            //     result = await ProcessCaseMatlabAsync(@case, filename);
            //     await File.WriteAllTextAsync(Context.TmpDir.OutputFile(caseId), result.Output.AsString());
            //     await File.WriteAllTextAsync(Context.TmpDir.ErrorFile(caseId), result.Error.AsString());
            // }
            // else
            // {
            //     SetPermissions();
            //     result = RunPipeline(
            //         $"{string.Join(" ", pipeline)}".ReplaceCommon(filename),
            //         Context.DockerTmpWorkdir,
            //         (int) Math.Ceiling(TimeRemaining),
            //         isUnitTest ? null : $"input/{@case.Id}",
            //         $"{Context.TmpDir.OutputDir.Dirname()}/{@case.Id}",
            //         $"{Context.TmpDir.ErrorDir.Dirname()}/{@case.Id}"
            //     );
            // }

            TimeRemaining -= result.Duration;
            subcase.Duration = result.Duration;
            subcase.Returncode = result.ReturnCode;
            subcase.FullCommand = result.FullCommand;
            subcase.Command = result.Command;

            CopyOutputFromDocker(@case);
            CopyErrorFromDocker(@case);
            CopyFromDocker(".report.json");
            foreach (var f in Context.CourseProblem.Export)
            {
                CopyFromDocker(f);
            }

            var reportJson = Context.TmpDir.RootFile(".report.json");
            if (File.Exists(reportJson))
            {
                var report = PythonReport.FromJson(reportJson.ReadAllText());
                Item.Results.AddRange(
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


            if (result.isOk)
            {
                subcase.Status = ProcessStatus.Ok.Value;
                subcase.Message = ProcessStatus.Ok.Description;
            }
            else
            {
                if (result.ReturnCode == 666)
                {
                    subcase.Status = ProcessStatus.GlobalTimeout.Value;
                    subcase.Message = ProcessStatus.GlobalTimeout.Description;
                    subcase.Messages = new[]
                    {
                        $"Available time: {TimeAvailable} sec",
                        $"Time Remaining: {TimeRemaining} sec",
                    };
                }
                else
                {
                    subcase.Status = ProcessStatus.ErrorWhileRunning.Value;
                    subcase.Message = ProcessStatus.ErrorWhileRunning.Description;
                    subcase.Messages = Context.GetTmpDirErrorMessage(@case.Id).SplitLines();
                }
            }

            return result;
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

        private void HandleTypeProgram(CourseProblemCase @case, ProcessResult result)
        {
            var caseResult = Item.Results.First(i => i.Case == @case.Id);
            var timeout = @case.Timeout < 0.001 ? 5 : @case.Timeout;
            var language = Context.Language;
            var scaledTimeout = language.ScalledTimeout(timeout);
            // var referenceFile = Context.ProblemDir.OutputFile(@case.Id);

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
            
            var runResult = RunPipeline(
                command: $"{string.Join(" ", pipeline)}".ReplaceCommon(reference.Name),
                workdir: Context.DockerDir.VerificationDir,
                timeout: 0,
                input: null,
                output: $"{@case.Id}.o",
                error: $"{@case.Id}.e"
            );

            if (runResult.IsBroken)
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

        private void HandleTypeLineByLine(CourseProblemCase @case, ProcessResult result)
        {
            var caseResult = Item.Results.First(i => i.Case == @case.Id);
            var timeout = @case.Timeout < 0.001 ? 5 : @case.Timeout;
            var language = Context.Language;
            var scalledTimeout = language.ScalledTimeout(timeout);
            var referenceFile = Context.ProblemDir.OutputFile(@case.Id);
            
            if (!File.Exists(referenceFile))
            {
                caseResult.Status = ProcessStatus.Skipped.Value;
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
                if (result.Duration > scalledTimeout)
                {
                    caseResult.Status = ProcessStatus.AnswerCorrectTimeout.Value;
                    caseResult.Message = ProcessStatus.AnswerCorrectTimeout.Description;
                    caseResult.Messages = new []
                    {
                        $"Allowed time for {caseResult.Case}: {scalledTimeout} sec (scalling: {language.ScaleInfo})",
                        $"Actual solution walltime: {result.Duration} sec",
                    };
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
            }
        }

        private void HandleTypeUnittest(CourseProblemCase @case, ProcessResult result)
        {
            var caseResult = Item.Results.First(i => i.Case == @case.Id);
            var timeout = @case.Timeout < 0.001 ? 5 : @case.Timeout;
            var language = Context.Language;
            var scalledTimeout = language.ScalledTimeout(timeout);
            var errorText = Context.TmpDir.ErrorFile(@case.Id).ReadAllText();
            
            if (string.IsNullOrEmpty(errorText))
            {
                if (result.Duration > scalledTimeout)
                {
                    caseResult.Status = ProcessStatus.AnswerCorrectTimeout.Value;
                    caseResult.Message = ProcessStatus.AnswerCorrectTimeout.Description;
                    caseResult.Messages = new []
                    {
                        $"Allowed time for {caseResult.Case}: {scalledTimeout} sec (scalling: {language.ScaleInfo})",
                        $"Actual solution walltime: {result.Duration} sec",
                    };
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