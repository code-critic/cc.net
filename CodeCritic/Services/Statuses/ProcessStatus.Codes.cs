using System.Collections.Generic;

namespace CC.Net.Services
{
    public enum ProcessStatusCodes
    {
        InQueue = 1,
        Running = 2,
        Skipped = 9,
        Ok = 10,
        GlobalTimeout = 12,
        AnswerCorrect = 100,
        AnswerCorrectTimeout = 101,
        AnswerWrong = 200,
        AnswerWrongTimeout = 201,
        CompilationFailed = 400,
        ErrorWhileRunning = 500,
        NoSolution = 666,
    }

    public interface IJson
    {
        string AsJson();
    }

    public partial class ProcessStatus : IJson
    {
        public static readonly ProcessStatus InQueue = new ProcessStatus(
            ProcessStatusCodes.InQueue,
            "in-queue",
            "In Queue",
            "IQ"
        );

        public static readonly ProcessStatus Running = new ProcessStatus(
            ProcessStatusCodes.Running,
            "running",
            "Running",
            "IP"
        );

        public static readonly ProcessStatus Ok = new ProcessStatus(
            ProcessStatusCodes.Ok,
            "ok",
            "Program ended gracefully",
            "OK"
        );

        public static readonly ProcessStatus Skipped = new ProcessStatus(
            ProcessStatusCodes.Skipped,
            "skipped",
            "Test was skipped",
            "SK"
        );

        public static readonly ProcessStatus GlobalTimeout = new ProcessStatus(
            ProcessStatusCodes.GlobalTimeout,
            "global-timeout",
            "Program had to be terminated since it did not end within designated time period",
            "TO"
        );

        public static readonly ProcessStatus AnswerCorrect = new ProcessStatus(
            ProcessStatusCodes.AnswerCorrect,
            "answer-correct",
            "Submitted solution is correct",
            "AC"
        );

        public static readonly ProcessStatus AnswerCorrectTimeout = new ProcessStatus(
            ProcessStatusCodes.AnswerCorrectTimeout,
            "answer-correct-timeout",
            "Solution is correct, but does not meet duration criteria",
            "AT"
        );

        public static readonly ProcessStatus AnswerWrong = new ProcessStatus(
            ProcessStatusCodes.AnswerWrong,
            "answer-wrong",
            "Submitted solution is wrong",
            "AW"
        );

        public static readonly ProcessStatus AnswerWrongTimeout = new ProcessStatus(
            ProcessStatusCodes.AnswerWrongTimeout,
            "answer-wrong-timeout",
            "Solution is wrong and does not meet duration criteria",
            "WT"
        );

        public static readonly ProcessStatus CompilationFailed = new ProcessStatus(
            ProcessStatusCodes.CompilationFailed,
            "compilation-failed",
            "Failed to compile",
            "CF"
        );

        public static readonly ProcessStatus ErrorWhileRunning = new ProcessStatus(
            ProcessStatusCodes.ErrorWhileRunning,
            "error-while-running",
            "Program ended with an error",
            "ER"
        );

        public static readonly ProcessStatus UknownStatus = new ProcessStatus(
            ProcessStatusCodes.ErrorWhileRunning,
            "uknown-status",
            "Status is unknown",
            "??"
        );

        public static readonly ProcessStatus NoSolution = new ProcessStatus(
            ProcessStatusCodes.NoSolution,
            "no-solution",
            "No solution recieved",
            "XX"
        );

        public static readonly List<ProcessStatus> All = new List<ProcessStatus>{
            InQueue,
            Running,
            Ok,
            Skipped,
            GlobalTimeout,
            AnswerCorrect,
            AnswerCorrectTimeout,
            AnswerWrong,
            AnswerWrongTimeout,
            CompilationFailed,
            ErrorWhileRunning,
            NoSolution,
        };

    }
}