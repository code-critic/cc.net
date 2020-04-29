using System;
using System.IO;
using CC.Net.Services.Courses;
using CC.Net.Utils;
using Microsoft.Extensions.Logging;

namespace CC.Net.Services
{
    public partial class ProcessItem
    {
        private void PrepareFiles()
        {
            try
            {
                PrepareLocalDir();
                CopyToDocker();
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error while preparing solution files on item {item}", Item);
            }
        }


        private ProcessResult CompileIfNeeded()
        {
            if (!Context.Language.CompilationNeeded)
            {
                return null;
            }

            return RunPipeline(
                $"{string.Join(" ", Context.Language.compile)}".Replace("<filename>", Context.MainFileName),
                Context.DockerTmpWorkdir,
                30, // fixed compilation timeout
                null,
                Context.CompilationFileName,
                Context.CompilationFileName
            );
        }

        public ProcessResult CopyOutputFromDocker(CourseProblemCase @case)
        {
            var cpCommand = $"docker cp \"{ProcessService.ContainerName}:{Context.DockerTmpWorkdir}/output/{@case.id}\" \"{Context.SolutionOutputDir}\"";
            return ProcessUtils.Popen(cpCommand);
        }

        public ProcessResult CopyErrorFromDocker(CourseProblemCase @case)
        {
            var cpCommand = $"docker cp \"{ProcessService.ContainerName}:{Context.DockerTmpWorkdir}/error/{@case.id}\" \"{Context.SolutionErrorDir}\"";
            return ProcessUtils.Popen(cpCommand);
        }

        public ProcessResult CopyFromDocker(string file)
        {
            var cpCommand = $"docker cp \"{ProcessService.ContainerName}:{Context.DockerTmpWorkdir}/{file}\" \"{Context.SolutionDir}\"";
            return ProcessUtils.Popen(cpCommand);
        }


        public void CopyToDocker()
        {
            // copy tmp to docker
            if (Context.Id == Guid.Empty.ToString())
            {
                ProcessUtils.Popen($"docker exec --user root {ProcessService.ContainerName} rm -rf {Context.DockerTmpWorkdir}");
            }

            var cpCommand = $"docker cp \"{Context.SolutionDir}\" \"{ProcessService.ContainerName}:{Context.DockerTmpWorkdir}\"";
            ProcessUtils.Popen(cpCommand);
        }

        public void PrepareLocalDir()
        {
            Directory.CreateDirectory(Context.SolutionDir);
            Directory.CreateDirectory(Context.SolutionInputDir);
            Directory.CreateDirectory(Context.SolutionOutputDir);
            Directory.CreateDirectory(Context.SolutionErrorDir);

            foreach (var solution in Item.Solutions)
            {
                File.WriteAllText(
                    Path.Combine(Context.SolutionDir, solution.Filename),
                    solution.Content
                );
            }

            // copy inputs to tmp
            foreach (var test in Context.CourseProblem.tests)
            {
                foreach (var subtest in test.Enumerate())
                {
                    var input = Context.ProblemInput(subtest.id);
                    File.WriteAllText(
                        Context.SolutionInput(subtest.id),
                        File.ReadAllText(input)
                    );
                }
            }
        }
    }
}