using System.Collections.Generic;

namespace CC.Net.Services
{
    public enum ProcessStatusCodes
    {
        InQueue = 1,
        Running = 2,
        Ok = 10,
        Skipped = 11,
        GlobalTimeout = 12,
        AnswerCorrect = 100,
        AnswerCorrectTimeout = 101,
        AnswerWrong = 200,
        AnswerWrongTimeout = 201,
        CompilationFailed = 400,
        ErrorWhileRunning = 500,
    }

    public partial class ProcessStatus
    {
        public static readonly ProcessStatus InQueue = new ProcessStatus(
            ProcessStatusCodes.InQueue,
            "in-queue",
            "In Queue"
        );

        public static readonly ProcessStatus Running = new ProcessStatus(
            ProcessStatusCodes.Running,
            "running",
            "Running"
        );

        public static readonly ProcessStatus Ok = new ProcessStatus(
            ProcessStatusCodes.Ok,
            "ok",
            "Program ended gracefully"
        );

        public static readonly ProcessStatus Skipped = new ProcessStatus(
            ProcessStatusCodes.Skipped,
            "skipped",
            "Test was skipped"
        );

        public static readonly ProcessStatus GlobalTimeout = new ProcessStatus(
            ProcessStatusCodes.GlobalTimeout,
            "global-timeout",
            "Program had to be terminated since ii did not end within designated time period"
        );

        public static readonly ProcessStatus AnswerCorrect = new ProcessStatus(
            ProcessStatusCodes.AnswerCorrect,
            "answer-correct",
            "Submitted solution is correct"
        );

        public static readonly ProcessStatus AnswerCorrectTimeout = new ProcessStatus(
            ProcessStatusCodes.AnswerCorrectTimeout,
            "answer-correct-timeout",
            "Solution is correct, but does not meet duration criteria"
        );

        public static readonly ProcessStatus AnswerWrong = new ProcessStatus(
            ProcessStatusCodes.AnswerWrong,
            "answer-wrong",
            "Submitted solution is wrong"
        );

        public static readonly ProcessStatus AnswerWrongTimeout = new ProcessStatus(
            ProcessStatusCodes.AnswerWrongTimeout,
            "answer-wrong-timeout",
            "Solution is wrong and does not meet duration criteria"
        );

        public static readonly ProcessStatus CompilationFailed = new ProcessStatus(
            ProcessStatusCodes.CompilationFailed,
            "compilation-failed",
            "Failed to compile"
        );

        public static readonly ProcessStatus ErrorWhileRunning = new ProcessStatus(
            ProcessStatusCodes.ErrorWhileRunning,
            "error-while-running",
            "Program ended with an error"
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
        };

    }
}