using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CC.Net.Collections;
using CC.Net.Extensions;
using CC.Net.Hubs;
using CC.Net.Services.Courses;
using Microsoft.Extensions.Logging;

namespace CC.Net.Services
{
    public partial class ProcessItem
    {

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
        }

        public async Task Solve()
        {
            var course = _courseService[Item.CourseName][Item.CourseYear];
            var problem = course[Item.Problem];
            var channel = _liveHub.Clients.Clients(_idService[Item.User]);

            Item.Result.Status = ProcessStatus.Running.Value;
            Item.Results = new List<CcDataCaseResult>();

            foreach (var subtest in problem.AllTests)
            {
                Item.Results.Add(new CcDataCaseResult()
                {
                    Case = subtest.id,
                    Status = ProcessStatus.InQueue.Value,
                });
            }

            await channel.OnProcessStart(Item);
            PrepareFiles();

            // compile if needed
            if (Context.Language.CompilationNeeded)
            {
                var compilationCase = new CcDataCaseResult
                {
                    Case = "Compilation",
                    Status = ProcessStatus.Running.Value,
                };
                Item.Results.Insert(0, compilationCase);
                await channel.OnProcessStart(Item);

                var compilationResult = CompileIfNeeded();
                if (compilationResult != null && compilationResult.IsBroken)
                {
                    _logger.LogError("Failed to compile");
                    CopyFromDocker(Context.CompilationFileName);
                    var compileError = Context.SolutionCompilationFile.ReadAllText();
                    compilationCase.Status = ProcessStatus.CompilationFailed.Value;
                    compilationCase.Message = ProcessStatus.CompilationFailed.Description;
                    compilationCase.Messages = (compileError ?? "Unknown Error").SplitLines();
                    await channel.OnProcessStart(Item);

                    DetermineResult();
                    return;
                }

                // remove if compilation was ok
                Item.Results.RemoveAt(0);
            }


            // solve all cases
            await SolveCasesAsync(problem.AllTests);
            DetermineResult();
            await channel.OnProcessStart(Item);
            //await dbService.Data.ReplaceOneAsync(i => i.Id == item.Id, item);
            return;
        }

        private async Task<IEnumerable<CourseProblemCase>> SolveCasesAsync(IEnumerable<CourseProblemCase> problems)
        {
            foreach (var subtest in problems)
            {
                try
                {
                    await SolveCaseAsync(subtest);
                }
                catch (Exception e)
                {
                    _logger.LogError(e, "Error while solving the subcase {subcase} on item {item}", subtest.id, Item);
                }
            }
            return problems;
        }


        private async Task SolveCaseAsync(CourseProblemCase @case)
        {
            var channel = _liveHub.Clients.Clients(_idService[Item.User]);
            var caseId = @case.id;
            var subcase = Item.Results.First(i => i.Case == caseId);
            var timeout = @case.timeout < 0.001 ? 5 : @case.timeout;
            var scalefactor = Context.Language.scale;
            var scalledTimeout = timeout * scalefactor;

            // ran out of time
            if (TimeRemaining < 0)
            {
                subcase.Status = ProcessStatus.Skipped.Value;
                subcase.Message = "Ran out of time";
                await channel.OnProcessStart(Item);
                return;
            }

            subcase.Status = ProcessStatus.Running.Value;
            await channel.OnProcessStart(Item);

            var result = RunPipeline(
                $"{string.Join(" ", Context.Language.run)}".Replace("<filename>", Context.MainFileName),
                Context.DockerTmpWorkdir,
                (int)Math.Ceiling(TimeRemaining),
                $"input/{@case.id}",
                $"output/{@case.id}",
                $"error/{@case.id}"
            );

            TimeRemaining -= result.Duration;


            if (result.isOk)
            {
                CopyOutputFromDocker(@case);
                subcase.Status = ProcessStatus.Ok.Value;
                subcase.Message = ProcessStatus.Ok.Description;
            }
            else
            {
                CopyOutputFromDocker(@case);
                CopyErrorFromDocker(@case);
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
                    subcase.Messages = Context.GetSolutionErrorMessage(@case.id).SplitLines();
                }
            }

            await channel.OnProcessStart(Item);
            var match = _compareService.CompareFiles(Context, @case);

            if (match.isOk)
            {
                if (result.Duration > scalledTimeout)
                {
                    subcase.Status = ProcessStatus.AnswerCorrectTimeout.Value;
                    subcase.Message = ProcessStatus.AnswerCorrectTimeout.Description;
                    subcase.Messages = new string[] {
                        $"Allowed time: {scalledTimeout} sec (programming language scale factor: {scalefactor}×)",
                        $"Program time: {result.Duration} sec",
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

            await channel.OnProcessStart(Item);
            Console.WriteLine(result);
        }

    }
}