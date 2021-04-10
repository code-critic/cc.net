using System.Collections.Generic;
using CC.Net.Services;

namespace Cc.Net.Services.Execution
{
    public class ExecutionCommand
    {
        // * timeout  = double timeout in seconds (soft deadline) = 60.0
        // * deadline = double timeout in seconds (hard deadline) = 120.0
        // * workdir  = work directory                            = null
        //   iPath    = input path                                = null
        //   oPath    = output path                               = /dev/null
        //   ePath    = error path                                = /dev/null
        //   ...      = arguments

        public double Timeout { get; set; } = 60.0;
        public double Deadline { get; set; } = 120.0;
        public string Workdir { get; set; }
        public string IPath { get; set; }
        public string OPath { get; set; }
        public string EPath { get; set; }
        public string Command { get; set; }
        
        public string User { get; set; } = "jan-hybs";
        public bool InDocker { get; set; } = true;

        public string FullCmd => string.Join(" ", AsArguments());
        public IEnumerable<string> AsArguments()
        {
            if (InDocker)
            {
                yield return $"docker exec --user {User} {ProcessService.ContainerName}";
            }
            
            yield return "python3 /bin/execute";
            yield return $"---timeout={Timeout:0.000}";
            yield return $"---deadline={Deadline:0.000}";
            yield return $"---workdir={Workdir}";

            if (!string.IsNullOrEmpty(IPath))
            {
                yield return $"---iPath={IPath}";
            }
            
            if (!string.IsNullOrEmpty(OPath))
            {
                yield return $"---oPath={OPath}";
            }
            
            if (!string.IsNullOrEmpty(EPath))
            {
                yield return $"---ePath={EPath}";
            }

            yield return Command;
        }
    }
}