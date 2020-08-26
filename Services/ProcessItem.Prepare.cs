using System;
using System.Collections.Generic;
using System.IO;
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

    public class PrepareItemResult
    {
        public CourseProblem Problem { get; set; }
        public CourseYearConfig Course { get; set; }
        public IClientProxy Channel { get; set; }
        public string Error { get; set; }
        public bool Failed => !string.IsNullOrEmpty(Error);

    }

    public partial class ProcessItem
    {
        private void PrepareFiles()
        {
            try
            {
                // prepare local directory
                PrepareLocalDir();

                // copy everything to docker
                CopyToDocker();

                // copy out everything from assets to root
                CopyInDocker("assets/*");

                // set permissions
                ProcessUtils.Popen($"docker exec --user root {ProcessService.ContainerName} chmod -R 777 {Context.DockerTmpWorkdir}");
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error while preparing solution files on item {item}", Item);
            }
        }

        private async Task<PrepareItemResult> PrepareItem()
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
                    Case = subtest.Id,
                    Status = ProcessStatus.InQueue.Value,
                });
            }

            await channel.ItemChanged(Item);
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
                await channel.ItemChanged(Item);

                var compilationResult = CompileIfNeeded();
                if (compilationResult != null && compilationResult.IsBroken)
                {
                    _logger.LogError("Failed to compile");
                    CopyFromDocker(Context.TmpDir.CompilationFile);
                    var compileError = Context.TmpDir.CompilationFile.ReadAllText();
                    compilationCase.Status = ProcessStatus.CompilationFailed.Value;
                    compilationCase.Message = ProcessStatus.CompilationFailed.Description;
                    compilationCase.Messages = (compileError ?? "Unknown Error").SplitLines();
                    await channel.ItemChanged(Item);

                    DetermineResult();
                    CopyToResultDir();
                    await channel.ItemChanged(Item);

                    return new PrepareItemResult
                    {
                        Channel = channel,
                        Problem = problem,
                        Course = course,
                        Error = "Failed to compile"
                    };
                }

                // remove if compilation was ok
                Item.Results.RemoveAt(0);
            }

            return new PrepareItemResult
            {
                Channel = channel,
                Problem = problem,
                Course = course,
            };
        }


        private ProcessResult CompileIfNeeded()
        {
            if (!Context.Language.CompilationNeeded)
            {
                return null;
            }

            return RunPipeline(
                $"{string.Join(" ", Context.Language.Compile)}".ReplaceCommon(Context.MainFileName),
                Context.DockerTmpWorkdir,
                30, // fixed compilation timeout
                null,
                CourseContext.CompilationFileName,
                CourseContext.CompilationFileName
            );
        }

        public ProcessResult CopyOutputFromDocker(CourseProblemCase @case)
        {
            var cpCommand = $"docker cp \"{ProcessService.ContainerName}:{Context.DockerTmpWorkdir}/output/{@case.Id}\" \"{Context.TmpDir.OutputDir}\"";
            return ProcessUtils.Popen(cpCommand);
        }

        public ProcessResult CopyErrorFromDocker(CourseProblemCase @case)
        {
            var cpCommand = $"docker cp \"{ProcessService.ContainerName}:{Context.DockerTmpWorkdir}/error/{@case.Id}\" \"{Context.TmpDir.ErrorDir}\"";
            return ProcessUtils.Popen(cpCommand);
        }

        public ProcessResult CopyFromDocker(string file)
        {
            var cpCommand = $"docker cp \"{ProcessService.ContainerName}:{Context.DockerTmpWorkdir}/{file}\" \"{Context.TmpDir.Root}\"";
            return ProcessUtils.Popen(cpCommand);
        }


        public void CopyToDocker()
        {
            // copy tmp to docker
            if (Context.Id == Guid.Empty.ToString())
            {
                ProcessUtils.Popen($"docker exec --user root {ProcessService.ContainerName} rm -rf {Context.DockerTmpWorkdir}");
            }

            var cpCommand = $"docker cp \"{Context.TmpDir.Root}\" \"{ProcessService.ContainerName}:{Context.DockerTmpWorkdir}\"";
            ProcessUtils.Popen(cpCommand);
        }

        public void CopyInDocker(string source, string dest="")
        {
            var cpCommand = $"cp {Context.DockerTmpWorkdir}/{source} {Context.DockerTmpWorkdir}/{dest}";
            var shCommand = $@"bash -c ""{cpCommand}""";
            var doCommand = $"docker exec --user root {ProcessService.ContainerName} {shCommand}";
            ProcessUtils.Popen(doCommand);
            // var cpCommand = $"docker cp \"{Context.TmpDir.Root}/{filename}\" \"{ProcessService.ContainerName}:{Context.DockerTmpWorkdir}/{filename}\"";
        }

        public void PrepareLocalDir()
        {
            // 1) delete tmp dir if exists
            if (Directory.Exists(Context.TmpDir.Root))
            {
                Directory.Delete(Context.TmpDir.Root, true);
            }

            // 2) create input, output, error but not the assets dirs
            Directory.CreateDirectory(Context.TmpDir.Root);
            Directory.CreateDirectory(Context.TmpDir.InputDir);
            Directory.CreateDirectory(Context.TmpDir.OutputDir);
            Directory.CreateDirectory(Context.TmpDir.ErrorDir);

            // 3) copy all solution files to the tmp dir root
            foreach (var solution in Item.Solutions)
            {
                File.WriteAllText(
                    Path.Combine(Context.TmpDir.Root, solution.Filename),
                    solution.Content
                );
            }

            // 4) copy all input files to tmpdir input dir
            foreach (var test in Context.CourseProblem.Tests)
            {
                foreach (var subtest in test.Enumerate())
                {
                    var input = Context.ProblemDir.InputFile(subtest.Id);
                    if (File.Exists(input))
                    {
                        File.WriteAllText(
                            Context.TmpDir.InputFile(subtest.Id),
                            File.ReadAllText(input)
                        );
                    }
                }
            }

            // 5) copy all assets to the tmpdir assets dir
            //      note: we cannot create assets since copying requires dir to not exists
            if (Directory.Exists(Context.ProblemDir.AssetsDir))
            {
                DirectoryUtils.Copy(Context.ProblemDir.AssetsDir, Context.TmpDir.AssetsDir);
            }
        }
    }
}