namespace CC.Net.Collections
{
    public class CCDataStatuses {

        public static readonly string InQueue = "in-queue";
        public static readonly string Running = "running";
        public static readonly string Ok = "ok";

        public static readonly string AnswerCorrect = "answer-correct";
        public static readonly string AnswerCorrectTimeout = "answer-correct-timeout";


        public static readonly string AnswerWrong = "answer-wrong";
        public static readonly string AnswerWrongTimeout = "answer-wrong-timeout";


        public static readonly string SoftTimeout = "soft-timeout";
        public static readonly string GlobalTimeout = "global-timeout";
        public static readonly string Skipped = "global-timeout";

        public static readonly string CompilationFailed = "compilation-failed";
        public static readonly string ErrorWhileRunning = "error-while-running";

    }
}