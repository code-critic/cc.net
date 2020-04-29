using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;

namespace CC.Net.Utils
{

    public class ProcessResult
    {
        public int ReturnCode { get; set; }
        public double Duration { get; set; }

        public string Command { get; set; }
        public string FullCommand { get; set; }

        public string InputFile { get; set; }
        public string OutputFile { get; set; }
        public string ErrorFile { get; set; }
        public string Workdir { get; set; }
        public int Timeout { get; set; }


        public List<string> Output { get; set; } = new List<string>();
        public List<string> Error { get; set; } = new List<string>();

        public bool isOk => ReturnCode == 0;
        public bool IsBroken => !isOk;
        
        public override string ToString()
        {
            return $"{Command} [{ReturnCode}] took [{Duration}]";
        }

    }
    public static class ProcessUtils
    {
        public static ProcessResult Popen(string cmd, int timeoutInSec = 120)
        {
            var args = cmd.Split(" ", 2);
            var binary = args.First();
            var rest = string.Join(" ", args.Skip(1));
            var returnCode = -1;

            var output = new List<string>();
            var error = new List<string>();

            var sw = new Stopwatch();
            sw.Start();
            using (var process = new Process())
            {
                process.StartInfo = new ProcessStartInfo(binary, rest)
                {
                    CreateNoWindow = true,
                    UseShellExecute = false,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true
                };

                process.OutputDataReceived += (p, s) =>
                {
                    if(s.Data != null) {
                        output.Add(s.Data);
                    }
                };
                process.ErrorDataReceived += (p, s) =>
                {
                    if (s.Data != null)
                    {
                        error.Add(s.Data);
                    }
                };

                process.Start();
                process.BeginOutputReadLine();
                process.BeginErrorReadLine();

                process.WaitForExit(timeoutInSec * 1000);

                if (!process.HasExited)
                {
                    process.Kill();
                }

                returnCode = process.ExitCode;
                process.Close();
            }
            sw.Stop();

            return new ProcessResult
            {
                ReturnCode = returnCode,
                Duration = sw.ElapsedMilliseconds / 1000.0,
                Output = output,
                Error = error,
                Command = cmd,
                FullCommand = cmd,
            };
        }
    }
}