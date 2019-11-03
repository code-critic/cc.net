
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
		CourseConfig: ICourseConfig;
		CourseYears: ICourseYearConfig[];
		Item: ICourseYearConfig;
		Name: string;
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
		id: string;
		Item: ICourseProblemCase;
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
		Item: ICourseProblem;
		Problems: ICourseProblem[];
		Year: string;
	}
	interface ICcData {
		action: string;
		attempt: number;
		course: string;
		docker: boolean;
		id: IObjectId;
		lang: string;
		objectId: string;
		output_dir: string;
		problem: string;
		result: ICcDataResult;
		results: ICcDataResult[];
		review_request: Date;
		solution: string;
		user: string;
		uuid: string;
	}
	interface ICcDataResult {
		cmd: string;
		console: string[];
		duration: number;
		id: string;
		message: string;
		message_details: string[];
		returncode: number;
		score: number;
		scores: number[];
		status: string;
		uuid: string;
	}
	interface IObjectId {
		CreationTime: Date;
		Empty: IObjectId;
		Increment: number;
		Machine: number;
		Pid: number;
		Timestamp: number;
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
