
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
		name: string;
		run: string[];
		scaleFactor: number;
		scaleInfo: string;
		scaleStart: number;
		unittest: string[];
		version: string;
	}
	export const enum ProblemStatus {
		BeforeStart = 0,
		Active = 1,
		ActiveLate = 2,
		AfterDeadline = 3
	}
	export const enum ProblemType {
		LineByLine = 1,
		Unittest = 2,
		Program = 3
	}
	export const enum SubmissionStatus {
		Unkown = 0,
		Intime = 1,
		Late = 2,
		None = 3
	}
	interface ICourse {
		courseConfig: ICourseConfig;
		courseDir: string;
		courseYears: ICourseYearConfig[];
		errors: string[];
		item: ICourseYearConfig;
		name: string;
		yaml: string;
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
		_avail: IDateTimeOrDays;
		_deadline: IDateTimeOrDays;
		_files: string[];
		_libname: string;
		_type: ProblemType;
		_unittest: boolean;
		allTests: ICourseProblemCase[];
		assets: string[];
		avail: Date;
		cat: string[];
		collaboration: ICourseProblemCollaborationConfig;
		courseYearConfig: ICourseYearConfig;
		deadline: Date;
		description: string;
		export: string[];
		files: string[];
		groupsAllowed: boolean;
		id: string;
		isActive: boolean;
		item: ICourseProblemCase;
		name: string;
		reference: ICourseReference;
		since: Date;
		status: string;
		statusCode: ProblemStatus;
		tests: ICourseProblemCase[];
		timeout: number;
		type: ProblemType;
		unittest: boolean;
	}
	interface ICourseProblemCase {
		id: string;
		random: number;
		size: number;
		test: string;
		timeout: number;
	}
	interface ICourseProblemCollaborationConfig {
		enabled: boolean;
		maxSize: number;
		minSize: number;
	}
	interface ICourseReference {
		hidden: boolean;
		lang: string;
		name: string;
	}
	interface ICourseTag {
		name: string;
		values: string[];
	}
	interface ICourseYearConfig {
		course: ICourse;
		item: ICourseProblem;
		problems: ICourseProblem[];
		results: ICcData[][];
		settingsConfig: ISettingsConfig;
		yaml: string;
		year: string;
	}
	interface ISettingsConfig {
		allStudents: IUser[];
		teachers: ISettingsConfigTeacher[];
		yaml: string;
	}
	interface ISettingsConfigTeacher {
		id: string;
		problems: string[];
		students: IUser[];
		tags: string[];
	}
	interface ISingleCourse {
		course: string;
		courseConfig: ICourseConfig;
		courseRef: ICourse;
		problems: ICourseProblem[];
		year: string;
	}
	export const enum CcEventType {
		Unknown = 0,
		NewComment = 1,
		NewGrade = 2,
		NewCodeReview = 3
	}
	export const enum CcUserGroupStatus {
		NotConfirmed = 0,
		Confirmed = 1,
		Rejected = 2
	}
	interface ICcData {
		action: string;
		attempt: number;
		comments: ILineComment[];
		courseName: string;
		courseYear: string;
		docker: boolean;
		gradeComment: string;
		groupId: IObjectId;
		groupName: string;
		groupUsers: string[];
		id: IObjectId;
		isActive: boolean;
		isGroup: boolean;
		language: string;
		objectId: string;
		points: number;
		problem: string;
		result: ICcDataResult;
		resultDirname: string;
		results: ICcDataCaseResult[];
		reviewRequest: Date;
		solutions: ICcDataSolution[];
		submissionStatus: SubmissionStatus;
		user: string;
		userOrGroupUsers: string[];
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
	interface ICcEvent {
		content: string;
		id: IObjectId;
		isNew: boolean;
		objectId: string;
		reciever: string;
		resultId: IObjectId;
		resultObjectId: string;
		sender: string;
		subject: string;
		type: CcEventType;
	}
	interface ICcGroup {
		id: IObjectId;
		isLocked: boolean;
		name: string;
		objectId: string;
		oid: string;
		owner: string;
		status: CcUserGroupStatus;
		users: ICcUserGroup[];
	}
	interface ICcUserGroup {
		name: string;
		status: CcUserGroupStatus;
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
		hidden: boolean;
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
	interface IDateTimeOrDays {
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
		comment: string;
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
		ErrorWhileRunning = 500,
		NoSolution = 666
	}
	interface IAppUser {
		affiliation: string;
		datetime: string;
		email: string;
		eppn: string;
		groups: ICcGroup[];
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
	interface IStudentScoreboardCourse {
		courseName: string;
		courseProblem: ICourseProblem;
		courseYear: string;
		objectId: string;
		problem: string;
		resultCount: number;
		results: ICcData[];
		score: number;
		since: Date;
	}
	interface IGradeDto {
		result: ICcData;
		user: IUser;
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
