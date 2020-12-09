
	export enum ProcessStatusCodes {
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
		NoSolution = 666
	}
	interface IProcessStatus {
		code: ProcessStatusCodes;
		description: string;
		letter: string;
		name: string;
		value: number;
	}
	export enum ChangeType {
		Unchanged = 0,
		Deleted = 1,
		Inserted = 2,
		Imaginary = 3,
		Modified = 4
	}
	export enum CcEventType {
		Unknown = 0,
		NewComment = 1,
		NewGrade = 2,
		NewCodeReview = 3
	}
	export enum ProblemStatus {
		BeforeStart = 0,
		Active = 1,
		ActiveLate = 2,
		AfterDeadline = 3
	}
	export enum SubmissionStatus {
		Unkown = 0,
		Intime = 1,
		Late = 2,
		None = 3
	}
	export class ProcessStatusStatic {
		public static InQueue: IProcessStatus = {
                code: ProcessStatusCodes.InQueue,
                value: 1,
                name: "in-queue",
                description: "In Queue",
                letter: "IQ",
            };

		public static Running: IProcessStatus = {
                code: ProcessStatusCodes.Running,
                value: 2,
                name: "running",
                description: "Running",
                letter: "IP",
            };

		public static Ok: IProcessStatus = {
                code: ProcessStatusCodes.Ok,
                value: 10,
                name: "ok",
                description: "Program ended gracefully",
                letter: "OK",
            };

		public static Skipped: IProcessStatus = {
                code: ProcessStatusCodes.Skipped,
                value: 9,
                name: "skipped",
                description: "Test was skipped",
                letter: "SK",
            };

		public static GlobalTimeout: IProcessStatus = {
                code: ProcessStatusCodes.GlobalTimeout,
                value: 12,
                name: "global-timeout",
                description: "Program had to be terminated since it did not end within designated time period",
                letter: "TO",
            };

		public static AnswerCorrect: IProcessStatus = {
                code: ProcessStatusCodes.AnswerCorrect,
                value: 100,
                name: "answer-correct",
                description: "Submitted solution is correct",
                letter: "AC",
            };

		public static AnswerCorrectTimeout: IProcessStatus = {
                code: ProcessStatusCodes.AnswerCorrectTimeout,
                value: 101,
                name: "answer-correct-timeout",
                description: "Solution is correct, but does not meet duration criteria",
                letter: "AT",
            };

		public static AnswerWrong: IProcessStatus = {
                code: ProcessStatusCodes.AnswerWrong,
                value: 200,
                name: "answer-wrong",
                description: "Submitted solution is wrong",
                letter: "AW",
            };

		public static AnswerWrongTimeout: IProcessStatus = {
                code: ProcessStatusCodes.AnswerWrongTimeout,
                value: 201,
                name: "answer-wrong-timeout",
                description: "Solution is wrong and does not meet duration criteria",
                letter: "WT",
            };

		public static CompilationFailed: IProcessStatus = {
                code: ProcessStatusCodes.CompilationFailed,
                value: 400,
                name: "compilation-failed",
                description: "Failed to compile",
                letter: "CF",
            };

		public static ErrorWhileRunning: IProcessStatus = {
                code: ProcessStatusCodes.ErrorWhileRunning,
                value: 500,
                name: "error-while-running",
                description: "Program ended with an error",
                letter: "ER",
            };

		public static UknownStatus: IProcessStatus = {
                code: ProcessStatusCodes.ErrorWhileRunning,
                value: 500,
                name: "uknown-status",
                description: "Status is unknown",
                letter: "??",
            };

		public static NoSolution: IProcessStatus = {
                code: ProcessStatusCodes.NoSolution,
                value: 666,
                name: "no-solution",
                description: "No solution recieved",
                letter: "XX",
            };

		public static All: IProcessStatus[] = [{
                code: ProcessStatusCodes.InQueue,
                value: 1,
                name: "in-queue",
                description: "In Queue",
                letter: "IQ",
            }, 
{
                code: ProcessStatusCodes.Running,
                value: 2,
                name: "running",
                description: "Running",
                letter: "IP",
            }, 
{
                code: ProcessStatusCodes.Ok,
                value: 10,
                name: "ok",
                description: "Program ended gracefully",
                letter: "OK",
            }, 
{
                code: ProcessStatusCodes.Skipped,
                value: 9,
                name: "skipped",
                description: "Test was skipped",
                letter: "SK",
            }, 
{
                code: ProcessStatusCodes.GlobalTimeout,
                value: 12,
                name: "global-timeout",
                description: "Program had to be terminated since it did not end within designated time period",
                letter: "TO",
            }, 
{
                code: ProcessStatusCodes.AnswerCorrect,
                value: 100,
                name: "answer-correct",
                description: "Submitted solution is correct",
                letter: "AC",
            }, 
{
                code: ProcessStatusCodes.AnswerCorrectTimeout,
                value: 101,
                name: "answer-correct-timeout",
                description: "Solution is correct, but does not meet duration criteria",
                letter: "AT",
            }, 
{
                code: ProcessStatusCodes.AnswerWrong,
                value: 200,
                name: "answer-wrong",
                description: "Submitted solution is wrong",
                letter: "AW",
            }, 
{
                code: ProcessStatusCodes.AnswerWrongTimeout,
                value: 201,
                name: "answer-wrong-timeout",
                description: "Solution is wrong and does not meet duration criteria",
                letter: "WT",
            }, 
{
                code: ProcessStatusCodes.CompilationFailed,
                value: 400,
                name: "compilation-failed",
                description: "Failed to compile",
                letter: "CF",
            }, 
{
                code: ProcessStatusCodes.ErrorWhileRunning,
                value: 500,
                name: "error-while-running",
                description: "Program ended with an error",
                letter: "ER",
            }, 
{
                code: ProcessStatusCodes.NoSolution,
                value: 666,
                name: "no-solution",
                description: "No solution recieved",
                letter: "XX",
            }]
	} // end of ProcessStatusStatic