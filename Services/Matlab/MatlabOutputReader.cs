using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace CC.Net.Services.Matlab
{

    public class MatlabStream
    {
        public List<string> Stdout = new List<string>();
        public List<string> StdErr = new List<string>();
        private readonly Process _process;
        private bool _stopReading = false;

        public MatlabStream(Process process)
        {
            _process = process;
        }

        public void StopReading()
        {
            _stopReading = true;
            _process.StandardOutput.Close();
            _process.StandardError.Close();
        }
        
        public void KeepReading()
        {
            _stopReading = false;
            new Thread(async () =>
            {
                while (!_stopReading)
                {
                    Stdout.Add(await _process.StandardOutput.ReadLineAsync());
                }
            }).Start();
            
            new Thread(async () =>
            {
                while (!_stopReading)
                {
                    StdErr.Add(await _process.StandardError.ReadLineAsync());
                }
            }).Start();
        }

        public async Task<(List<string>, List<string>)> Communicate(string command, string terminator)
        {
            return await Communicate(new [] { command }, terminator);
        }
        
        public async Task<(List<string>, List<string>)> Communicate(IEnumerable<string> commands, string terminator)
        {
            Stdout = new List<string>();
            StdErr = new List<string>();

            foreach (var command in commands)
            {
                await _process.StandardInput.SendCommandAsync(command);
            }
            
            return await ReadUntil(terminator);
        }
        
        public async Task<(List<string>, List<string>)> ReadUntil(string terminator)
        {

            var result = new List<string>();
            var i = 10;
            
            while (i-- > 0)
            {
                if (Stdout.Any(j => j.Contains(terminator)))
                {
                    var errorMsg = "Error in run (line";
                    var errorIdx = StdErr.FindIndex(j => j.Contains(errorMsg));
                    
                    return (
                        Stdout.Where(j => !j.Contains(terminator)).ToList(), 
                        StdErr.Take(Math.Max(0, errorIdx))
                            .Where(j => !string.IsNullOrEmpty(j))
                            .ToList()
                    );
                }
                
                await Task.Delay(1000);
            }

            return (Stdout, StdErr);
        }
    }
    
    public static class MatlabStreamUtils
    {
        
        
        public static void KeepReading(this StreamReader reader)
        {
            new Thread(async () =>
            {
                while (true)
                {
                    var line = await reader.ReadLineAsync();
                    Console.WriteLine($"<<< {line}");
                }
            }).Start();
        }
        
        public static async Task SendCommandAsync(this StreamWriter writer, string command, bool semicolon = true)
        {
            var line = semicolon ? $"{command};" : command;
            await writer.WriteLineAsync(line);
            Console.WriteLine($">>> {line}");
        }
        
        public static async Task<List<string>> ReadUntilAsync(this StreamReader reader, string terminator)
        {
            var lines = new List<string>();
            
            while (true)
            {
                var line = await reader.ReadLineAsync() ?? "---empty---";
                
                Console.WriteLine($"got {line}");
                if (line.Contains(terminator))
                {
                    break;
                }
                lines.Add(line);
            }

            return lines;
        }

        public static async Task<TResult> TimeoutAfter<TResult>(this Task<TResult> task, TimeSpan timeout) {

            using (var timeoutCancellationTokenSource = new CancellationTokenSource()) {

                var completedTask = await Task.WhenAny(task, Task.Delay(timeout, timeoutCancellationTokenSource.Token));
                if (completedTask == task) {
                    timeoutCancellationTokenSource.Cancel();
                    return await task;  // Very important in order to propagate exceptions
                } else {
                    throw new TimeoutException("The operation has timed out.");
                }
            }
        }
    }

}