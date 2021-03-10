using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using CC.Net.Utils;
using Microsoft.Extensions.Logging;

namespace CC.Net.Services.Matlab
{

    public class MatlabServer
    {
        private readonly ILogger<MatlabServer> _logger;
        private int Pid { get; set; } = -1;

        private Process _server { get; set; }
        private MatlabStream _stream { get; set; }
        
        private string DockerExec { get; set; }
        private string DockerExecI { get; set; }
        private string ContainerName { get; set; }

        public MatlabServer(ILogger<MatlabServer> logger)
        {
            _logger = logger;
        }

        private async Task StartServerAsync()
        {
            var cmd = $"{DockerExecI} matlab -nodesktop -nosplash -nodisplay";
            var args = cmd.Split(" ", 2);
            var binary = args.First();
            var rest = string.Join(" ", args.Skip(1));

            _server = new Process();
            _server.StartInfo = new ProcessStartInfo(binary, rest)
            {
                CreateNoWindow = true,
                UseShellExecute = false,
                RedirectStandardInput = true,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
            };

            //_server.OutputDataReceived += (p, s) => { _logger.LogWarning("OUT {data}", s.Data); };
            //_server.ErrorDataReceived += (p, s) => { _logger.LogWarning("ERR {data}", s.Data); };
            

            _server.Start();
            _stream = new MatlabStream(_server);
            _stream.KeepReading();
            //_server.BeginOutputReadLine();
            //_server.BeginErrorReadLine();

            Pid = _server.Id;
        }

        public async Task<ProcessResult> RunFileAsync(string filename, string terminator, string resetFilename, string dockerTmpWorkdir)
        {
            if (!IsRunning())
            {
                await StartServerAsync();
                //_server.StandardOutput.KeepReading();
                //_server.StandardError.KeepReading();
                _logger.LogWarning($"!! IsRunning: {IsRunning()} {Pid}");
            }

            if (!IsRunning())
            {
                _logger.LogError("not running");
            }

            var cdCmd = $@"cd(""{dockerTmpWorkdir}"")";
            var resetCmd = $@"run(""{resetFilename}"")";
            var (o0, e0) = await _stream.Communicate(new []{ cdCmd, "cd", resetCmd }, terminator);

            var sw = Stopwatch.StartNew();
            var startCmd = $@"run(""{filename}"")";
            var terminateCmd = $@"fprintf(""matlab-server-command-mode:ready-{terminator}\n"")";
            var (o1, e1) = await _stream.Communicate(new []{ startCmd, terminateCmd }, terminator);
            
            var result = new ProcessResult
            {
                ReturnCode = e1.Any() ? 1 : 0,
                Duration = sw.ElapsedMilliseconds / 1000.0,
                Output = o1,
                Error = e1,
                Command = startCmd,
                FullCommand = startCmd,
            };
            sw.Stop();

            return result;
        }

        private async Task InteractiveConsole()
        {
            while (true)
            {
                var line = Console.ReadLine()?.Trim();
                if (line == null || line.Contains("..."))
                {
                    break;
                }

                await _server.StandardInput.SendCommandAsync(line, false);
            }
        }

        public void Initialize(string dockerExec)
        {
            ContainerName = dockerExec;
            DockerExec = $"docker exec --user jan-hybs {ContainerName}";
            DockerExecI = $"docker exec --user jan-hybs -i {ContainerName}";
            // pkill -f MATLAB
        }

        private bool IsRunning()
        {
            return Pid != -1 && ProcessUtils.Popen($"kill -0 {Pid}").ReturnCode == 0;
        }
    }

}