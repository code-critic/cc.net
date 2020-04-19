
	interface IUser {
		id: string;
		tags: string[];
	}
	interface ILanguage {
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
		avail: string;
		cat: string;
		description: string;
		id: string;
		item: ICourseProblemCase;
		name: string;
		reference: ICourseReference;
		since: string;
		tests: ICourseProblemCase[];
		timeout: number;
	}
	interface ICourseProblemCase {
		id: string;
		random: number;
		size: number;
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
		course: string;
		courseName: string;
		courseYear: string;
		docker: boolean;
		id: IObjectId;
		lang: string;
		objectId: string;
		output_dir: string;
		points: number;
		problem: string;
		result: ICcDataResult;
		results: ICcDataResult[];
		review_request: Date;
		solution: string;
		user: string;
		uuid: string;
	}
	interface ICcDataAgg {
		id: ICcDataAggId;
		result: ICcData;
	}
	interface ICcDataAggId {
		problem: string;
		user: string;
	}
	interface ICcDataResult {
		caseId: string;
		cmd: string;
		console: string[];
		duration: number;
		message: string;
		message_details: string[];
		returncode: number;
		score: number;
		scores: number[];
		status: string;
		uuid: string;
	}
	interface IObjectId {
		creationTime: Date;
		empty: IObjectId;
		increment: number;
		machine: number;
		pid: number;
		timestamp: number;
	}
	interface IDiffResult {
		filename: string;
		lines: IDiffPiece[];
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
