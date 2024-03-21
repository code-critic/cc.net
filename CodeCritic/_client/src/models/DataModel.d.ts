import { ProcessStatus, SubmissionStatus, ProblemType, ProblemStatus, CcEventType, CcUserGroupStatus, DiffResultLineType, ProcessStatusCodes, ChangeType } from  './Enums'

	interface IUser {
		id: string;
		tags: string[];
	}
	interface ILanguage {
		compilationNeeded: boolean;
		compile: string[];
		disabled: boolean;
		extension: string;
		files: IKeyValuePair[][];
		id: string;
		name: string;
		run: string[];
		scaleFactor: number;
		scaleInfo: string;
		scaleStart: number;
		unittest: string[];
		version: string;
	}
	interface IKeyValuePair {
		key: ITKey;
		value: ITValue;
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
	interface ICourseGroup {
	}
	interface ICourseProblem {
		_avail: IDateTimeOrDays;
		_deadline: IDateTimeOrDays;
		_files: string[];
		_libname: string;
		_type: ProblemType;
		_unittest: IOneOf;
		assets: string[];
		avail: Date;
		cat: string[];
		collaboration: ICourseProblemCollaborationConfig;
		complexDescriptionPage: string;
		course: string;
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
		section: string;
		showDescription: boolean;
		since: Date;
		statusCode: ProblemStatus;
		tests: ICourseProblemCase[];
		timeout: number;
		type: ProblemType;
		unittest: IUnittestSpec[];
		year: string;
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
		courseGroup: ICourseGroup;
		item: ICourseProblem;
		problems: ICourseProblem[];
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
		settingsConfig: ISettingsConfig;
		year: string;
	}
	interface IUnittestSpec {
		entrypoint: string;
		hidden: boolean;
		lang: string;
		libname: string;
		methods: string[];
	}
	interface IOneOf {
		asT0: IT0;
		asT1: IT1;
		index: number;
		isT0: boolean;
		isT1: boolean;
		value: any;
	}
	interface IDateTimeOrDays {
	}
	interface ICcData {
		action: string;
		attempt: number;
		comments: ILineComment[];
		courseName: string;
		courseYear: string;
		docker: boolean;
		files: ISimpleFile[];
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
		timeLimit: number;
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
	interface ISimpleFile {
		content: any;
		filename: string;
		files: ISimpleFile[];
		isDir: boolean;
		rawPath: string;
		relPath: string;
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
	interface ISimpleFileDto {
		content: string;
		name: string;
		path: string;
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
		data: ICcDataDto[];
	}
	interface ICcDataDto {
		attempt: number;
		comments: number;
		course: string;
		date: Date;
		duration: number;
		group: string;
		isLate: string;
		language: string;
		objectId: string;
		points: number;
		problem: string;
		reviewRequest: Date;
		score: string;
		status: string;
		users: string[];
		year: string;
	}
	interface ICcDataLight {
		attempt: number;
		groupUsers: string[];
		id: IObjectId;
		objectId: string;
		points: number;
		reviewRequest: Date;
		status: number;
		user: string;
	}
	interface IGradeDto {
		result: ICcDataDto;
		user: IUser;
	}
	interface IAppUser {
		affiliation: string;
		datetime: string;
		email: string;
		eppn: string;
		groups: ICcGroup[];
		id: string;
		isCurrentlyRoot: boolean;
		isRoot: boolean;
		lastFirstName: string;
		role: string;
		roles: string[];
		serverMessage: string;
		serverStatus: string;
		username: string;
		version: string;
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
	interface IUnauthorizedObjectIface {
		error: number;
		message: string;
		redirect: string;
	}
	interface IApiError {
		errors: string[];
		name: string;
	}
	interface IDiffPiece {
		position: number;
		subPieces: IDiffPiece[];
		text: string;
		type: ChangeType;
	}


// generated at 21/03/2024 07:13:20 (UTC)
export const __uuid = '197b0d9c-e409-4b6e-8d96-61ea44d8b7e8'