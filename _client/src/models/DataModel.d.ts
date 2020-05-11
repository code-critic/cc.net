
	interface IUser {
		id: string;
		tags: string[];
	}
	interface ILanguage {
		compilationNeeded: boolean;
		compile: string[];
		disabled: boolean;
		extension: string;
		id: string;
		image: string;
		name: string;
		run: string[];
		scale: number;
		style: string;
		version: string;
	}
	interface ICourse {
		courseConfig: ICourseConfig;
		courseDir: string;
		courseYears: ICourseYearConfig[];
		item: ICourseYearConfig;
		name: string;
	}
	interface ICourseConfig {
		access: string;
		desc: string;
		disabled: boolean;
		name: string;
		students: IUser[];
		tags: ICourseTag[];
		teachers: IUser[];
	}
	interface ICourseProblem {
		allTests: ICourseProblemCase[];
		avail: string;
		cat: string;
		description: string;
		id: string;
		item: ICourseProblemCase;
		libname: string;
		name: string;
		reference: ICourseReference;
		since: string;
		tests: ICourseProblemCase[];
		timeout: number;
		unittest: boolean;
	}
	interface ICourseProblemCase {
		id: string;
		random: number;
		size: number;
		test: string;
		timeout: number;
	}
	interface ICourseReference {
		lang: string;
		name: string;
	}
	interface ICourseTag {
		name: string;
		values: string[];
	}
	interface ICourseYearConfig {
		item: ICourseProblem;
		problems: ICourseProblem[];
		year: string;
	}
	interface ISingleCourse {
		course: string;
		courseConfig: ICourseConfig;
		problems: ICourseProblem[];
		year: string;
	}
	interface ICcData {
		action: string;
		attempt: number;
		comments: ILineComment[];
		courseName: string;
		courseYear: string;
		docker: boolean;
		id: IObjectId;
		language: string;
		objectId: string;
		points: number;
		problem: string;
		resu: string;
		result: ICcDataResult;
		results: ICcDataCaseResult[];
		reviewRequest: Date;
		solutions: ICcDataSolution[];
		user: string;
	}
	interface ICcDataAgg {
		id: ICcDataAggId;
		result: ICcData;
	}
	interface ICcDataAggId {
		problem: string;
		user: string;
	}
	interface ICcDataCaseResult extends ICcDataResult {
		case: string;
		command: string;
		fullCommand: string;
		returncode: number;
	}
	interface ICcDataResult {
		console: string[];
		duration: number;
		message: string;
		messages: string[];
		score: number;
		scores: number[];
		status: number;
	}
	interface IObjectId {
		creationTime: Date;
		empty: IObjectId;
		increment: number;
		machine: number;
		pid: number;
		timestamp: number;
	}
	interface ICcDataSolution {
		content: string;
		filename: string;
		index: number;
		isDynamic: boolean;
		isMain: boolean;
		isSeparator: boolean;
	}
	interface ILineComment {
		filename: string;
		line: number;
		text: string;
		time: number;
		user: string;
	}
	export const enum DiffResultLineType {
		Correct = 1,
		Wrong = 2
	}
	interface IDiffResult {
		generated: string;
		isOk: boolean;
		lines: IDiffPiece[];
		reference: string;
	}
	interface IDiffResultComposite {
		error: string;
		generated: string;
		isOk: boolean;
		lines: IDiffResultLine[];
		reference: string;
	}
	interface IDiffResultLine {
		generated: string;
		reference: string;
		type: DiffResultLineType;
	}
	interface IMarkSolutionItem {
		objectId: string;
		points: number;
	}
	interface ITableRequest {
		filtered: ITableRequestFilter[];
		page: number;
		pageSize: number;
		sorted: ITableRequestSort[];
	}
	interface ITableRequestFilter {
		id: string;
		value: string;
	}
	interface ITableRequestSort {
		desc: boolean;
		id: string;
	}
	interface ITableResponse {
		count: number;
		data: any[];
	}
	export const enum ProcessStatusCodes {
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
		ErrorWhileRunning = 500
	}
	interface IAppUser {
		affiliation: string;
		datetime: string;
		email: string;
		eppn: string;
		id: string;
		isRoot: boolean;
		lastFirstName: string;
		role: string;
		roles: string[];
		username: string;
	}
	interface IProcessStatus {
		code: ProcessStatusCodes;
		description: string;
		letter: string;
		name: string;
		value: number;
	}
	interface ICommentServiceItem {
		comment: ILineComment;
		objectId: string;
	}
	export const enum ChangeType {
		Unchanged = 0,
		Deleted = 1,
		Inserted = 2,
		Imaginary = 3,
		Modified = 4
	}
	interface IDiffPiece {
		position: number;
		subPieces: IDiffPiece[];
		text: string;
		type: ChangeType;
	}
