using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using CC.Net.Utils;
using Microsoft.Extensions.Logging;
using MongoDB.Bson;

namespace CC.Net.Services
{
    public class MatlabServer
    {
        public readonly ILogger<MatlabServer> _logger;
        private int pid { get; set; } = -1;

        private Process _server { get; set; }

        private string DockerExec { get; set; }
        private string DockerExecI { get; set; }
        private string ContainerName { get; set; }

        public MatlabServer(ILogger<MatlabServer> logger)
        {
            _logger = logger;
        }

        public async Task StartServerAsync()
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

            _server.Start();
            await _server.StandardInput.WriteLineAsync("1:5");

            _server.WaitForExit();
            pid = _server.Id;

            await Task.Delay(1000);
    }

    public async Task RunFileAsync(string filename)
    {
        if (!IsRunning())
        {
            await StartServerAsync();
            _logger.LogWarning($"!! IsRunning: {IsRunning()} {pid}");
            await Task.Delay(1000*10);
            _logger.LogWarning($"!! IsRunning: {IsRunning()} {pid}");
        }
    }

    public void Initialize(string dockerExec)
    {
        ContainerName = dockerExec;
        DockerExec = $"docker exec --user jan-hybs {ContainerName}";
        DockerExecI = $"docker exec --user jan-hybs -i {ContainerName}";
        // pkill -f MATLAB
    }

    private void ExecCommand(string cmd)
    {
        var args = cmd.Split(" ", 2);
        var binary = args.First();
        var rest = string.Join(" ", args.Skip(1));
        var returnCode = -1;

        var process = new Process();
        process.StartInfo = new ProcessStartInfo(binary, rest)
        {
            CreateNoWindow = true,
            UseShellExecute = false,
            RedirectStandardOutput = true,
            RedirectStandardError = true
        };

        process.OutputDataReceived += (p, s) =>
        {
            Console.WriteLine("OUT", s.Data);
        };
        process.ErrorDataReceived += (p, s) =>
        {
            Console.WriteLine("ERR", s.Data);
        };

        process.Start();
        process.BeginOutputReadLine();
        process.BeginErrorReadLine();
    }

    public bool IsRunning()
    {
        return pid != -1 && ProcessUtils.Popen($"{DockerExec} kill -0 {pid}").ReturnCode == 0;
    }
}
}