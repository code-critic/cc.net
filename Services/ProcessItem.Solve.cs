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
            if(ensuryEmpty)
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

        private void CopyToResultDir(bool ensuryEmpty = true)
        {
            var targetDir = Item.ResultDir(Context.CourseDir);
            var sourceDir = Context.TmpDir.Root;

            CopyToResultDir(sourceDir, targetDir, ensuryEmpty);
        }


        private ProcessResult SolveCaseBase(CourseProblemCase @case)
        {
            var caseId = @case.Id;
            var subcase = Item.Results.First(i => i.Case == caseId);
            var timeout = @case.Timeout < 0.001 ? 5 : @case.Timeout;
            var language = Context.Language;
            var scalledTimeout = language.ScalledTimeout(timeout);

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
            var isUnitTest = Context.CourseProblem.Unittest;
            var filename = isUnitTest
                ? Context.CourseProblem.Reference.Name
                : Context.MainFileName;
            
            var pipeline = isUnitTest && language.Unittest.Any()
                ? language.Unittest
                : language.Run;

            var result = RunPipeline(
                $"{string.Join(" ", pipeline)}".Replace("<filename>", filename),
                Context.DockerTmpWorkdir,
                (int)Math.Ceiling(TimeRemaining),
                isUnitTest ? null : $"input/{@case.Id}",
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
            CopyFromDocker(".report.json");

            var reportJson = Context.TmpDir.RootFile(".report.json");
            if(File.Exists(reportJson))
            {
                Console.WriteLine(reportJson.ReadAllText());
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
                    subcase.Messages = new string[] {
                        $"Available time: {TimeAvailable} sec",
                        $"Time Remaning:  {TimeRemaining} sec",
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

        private async Task SolveCaseAsync(CourseProblemCase @case)
        {

            var result = SolveCaseBase(@case);
            if (result.IsBroken)
            {
                return;
            }

            var subcase = Item.Results.First(i => i.Case == @case.Id);
            var timeout = @case.Timeout < 0.001 ? 5 : @case.Timeout;
            var language = Context.Language;
            var scalledTimeout = language.ScalledTimeout(timeout);


            if (Context.CourseProblem.Unittest)
            {
                var errorText = Context.TmpDir.ErrorFile(@case.Id).ReadAllText();
                if(string.IsNullOrEmpty(errorText))
                {
                    if (result.Duration > scalledTimeout)
                    {
                        subcase.Status = ProcessStatus.AnswerCorrectTimeout.Value;
                        subcase.Message = ProcessStatus.AnswerCorrectTimeout.Description;
                        subcase.Messages = new string[] {
                        $"Allowed time for {subcase.Case}: {scalledTimeout} sec (scalling: {language.ScaleInfo})",
                        $"Actual solution walltime: {result.Duration} sec",
                    };
                    }
                    else
                    {
                        subcase.Status = ProcessStatus.AnswerCorrect.Value;
                        subcase.Message = ProcessStatus.AnswerCorrect.Description;
                    }
                }
                else
                {
                    subcase.Status = ProcessStatus.AnswerWrong.Value;
                    subcase.Message = ProcessStatus.AnswerWrong.Description;
                    subcase.Messages = errorText.SplitLines();
                }
                return;
            }

            var diffResult = _compareService.CompareFiles(Context, @case);

            if (diffResult.isOk)
            {
                if (result.Duration > scalledTimeout)
                {
                    subcase.Status = ProcessStatus.AnswerCorrectTimeout.Value;
                    subcase.Message = ProcessStatus.AnswerCorrectTimeout.Description;
                    subcase.Messages = new string[] {
                        $"Allowed time for {subcase.Case}: {scalledTimeout} sec (scalling: {language.ScaleInfo})",
                        $"Actual solution walltime: {result.Duration} sec",
                    };
                }
                else
                {
                    subcase.Status = ProcessStatus.AnswerCorrect.Value;
                    subcase.Message = ProcessStatus.AnswerCorrect.Description;
                }
            }
            else
            {
                subcase.Status = ProcessStatus.AnswerWrong.Value;
                subcase.Message = ProcessStatus.AnswerWrong.Description;
            }
        }

    }
}