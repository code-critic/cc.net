using System;
using System.Collections.Generic;
using CC.Net.Services.Languages;
using cc.net.Services.Processing;
using Newtonsoft.Json;

namespace Cc.Net.Services.Execution
{
    public class ExecutionResult
    {
        [JsonProperty("code")]
        public ExecutionStatus Code { get; set; }

        [JsonProperty("status")]
        public string Status { get; set; }

        [JsonProperty("duration")]
        public double Duration { get; set; }

        [JsonProperty("message")]
        public string Message { get; set; }

        [JsonProperty("messages")]
        public List<string> Messages { get; set; } = new List<string>();

        [JsonProperty("returncode")]
        public int ReturnCode { get; set; }


        [JsonIgnore]
        public ExecutionCommand ExecutionCommand { get; set; }

        public bool IsBroken => ReturnCode != 0;

        public bool IsTimeOuted => Code == ExecutionStatus.ErrorTimeout
           || Code == ExecutionStatus.OkTimeout
           || Code == ExecutionStatus.GlobalTimeout;

        public IEnumerable<string> CreateDeadlineMessages(TimeBank bank)
        {
            yield return "Solution ran out of global time!";
            yield return $"Allowed global walltime  : {bank.LanguageDeadline:0.000}";
            yield return $"Solution global walltime : {bank.WallTime:0.000}";
            yield return $"Global baseline timeout  : {bank.LanguageDeadline:0.000}";
            yield return $"Language compensation    : [{bank.Language.ScaleInfo}] for {bank.Language.Name}";
        }
        
        public IEnumerable<string> CreateTimeoutMessages(double caseTimeout, Language language)
        {
            if (!(Duration > ExecutionCommand.Timeout))
            {
                yield break;
            }

            yield return "Program exceeded allowed time limit!";
            yield return $"Allowed walltime:      {ExecutionCommand.Timeout:0.000}";
            yield return $"Program walltime:      {Duration:0.000}";
            yield return $"Baseline timeout:      {caseTimeout:0.000}";
            yield return $"Language compensation: [{language.ScaleInfo}] for {language.Name}";
        }
    }
}