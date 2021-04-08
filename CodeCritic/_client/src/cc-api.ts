/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface IApiError {
  name?: string | null;
  errors?: string[] | null;
}

export interface IAppUser {
  eppn?: string | null;
  affiliation?: string | null;
  datetime?: string | null;
  role?: string | null;
  id?: string | null;
  isRoot?: boolean;
  isCurrentlyRoot?: boolean;
  username?: string | null;
  lastFirstName?: string | null;
  email?: string | null;
  roles?: string[] | null;
  groups?: ICcGroup[] | null;
}

export interface ICcData {
  id?: IObjectId;
  objectId?: string | null;
  isActive?: boolean;
  user?: string | null;
  groupName?: string | null;
  groupId?: IObjectId;
  groupUsers?: string[] | null;
  resultDirname?: string | null;
  isGroup?: boolean;
  userOrGroupUsers?: string[] | null;
  courseName?: string | null;
  courseYear?: string | null;
  problem?: string | null;
  action?: string | null;
  docker?: boolean;
  result?: ICcDataResult;
  results?: ICcDataCaseResult[] | null;
  language?: string | null;
  solutions?: ICcDataSolution[] | null;
  submissionStatus?: ISubmissionStatus;

  /** @format int32 */
  attempt?: number;

  /** @format float */
  points?: number;
  gradeComment?: string | null;

  /** @format date-time */
  reviewRequest?: string | null;
  comments?: ILineComment[] | null;
  files?: ISimpleFile[] | null;
}

export interface ICcDataApiListResponse {
  data?: ICcData[] | null;
  errors?: IApiError[] | null;
}

export interface ICcDataApiResponse {
  data?: ICcData;
  errors?: IApiError[] | null;
}

export interface ICcDataCaseResult {
  /** @format int32 */
  status?: number;

  /** @format double */
  duration?: number;
  message?: string | null;

  /** @format int32 */
  score?: number;
  scores?: number[] | null;
  console?: string[] | null;
  messages?: string[] | null;
  case?: string | null;

  /** @format int32 */
  returncode?: number;
  command?: string | null;
  fullCommand?: string | null;
}

export interface ICcDataDto {
  /** @format double */
  duration?: number;
  group?: string | null;
  status?: string | null;

  /** @format float */
  points?: number;
  score?: string | null;

  /** @format int32 */
  comments?: number;
  isLate?: string | null;

  /** @format date-time */
  reviewRequest?: string | null;
  problem?: string | null;
  year?: string | null;
  course?: string | null;
  language?: string | null;
  users?: string[] | null;

  /** @format date-time */
  date?: string;

  /** @format int32 */
  attempt?: number;
  objectId?: string | null;
}

export interface ICcDataLight {
  id?: IObjectId;
  objectId?: string | null;

  /** @format int32 */
  status?: number;

  /** @format int32 */
  attempt?: number;

  /** @format date-time */
  reviewRequest?: string | null;

  /** @format float */
  points?: number;
  user?: string | null;
  groupUsers?: string[] | null;
}

export interface ICcDataLightApiListResponse {
  data?: ICcDataLight[] | null;
  errors?: IApiError[] | null;
}

export interface ICcDataResult {
  /** @format int32 */
  status?: number;

  /** @format double */
  duration?: number;
  message?: string | null;

  /** @format int32 */
  score?: number;
  scores?: number[] | null;
  console?: string[] | null;
  messages?: string[] | null;
}

export interface ICcDataSolution {
  filename?: string | null;
  content?: string | null;

  /** @format int32 */
  index?: number;
  isMain?: boolean;
  hidden?: boolean;
  isDynamic?: boolean;
  isSeparator?: boolean;
}

export interface ICcEvent {
  id?: IObjectId;
  objectId?: string | null;
  resultId?: IObjectId;
  resultObjectId?: string | null;
  sender?: string | null;
  reciever?: string | null;
  subject?: string | null;
  content?: string | null;
  type?: ICcEventType;
  isNew?: boolean;
}

export interface ICcEventApiListResponse {
  data?: ICcEvent[] | null;
  errors?: IApiError[] | null;
}

/**
 * @format int32
 */
export type ICcEventType = 0 | 1 | 2 | 3;

export interface ICcGroup {
  id?: IObjectId;
  objectId?: string | null;
  oid?: string | null;
  isLocked?: boolean;
  owner?: string | null;
  name?: string | null;
  status?: ICcUserGroupStatus;
  users?: ICcUserGroup[] | null;
}

export interface ICcUserGroup {
  name?: string | null;
  status?: ICcUserGroupStatus;
}

/**
 * @format int32
 */
export type ICcUserGroupStatus = 0 | 1 | 2;

export interface ICcUserGroupUpdate {
  name?: string | null;
  status?: ICcUserGroupStatus;
  oid?: string | null;
}

export interface ICommentServiceItem {
  comment?: ILineComment;
  objectId?: string | null;
}

export interface ICourse {
  name?: string | null;
  courseConfig?: ICourseConfig;
  courseYears?: ICourseYearConfig[] | null;
  courseDir?: string | null;
  errors?: string[] | null;
}

export interface ICourseConfig {
  name?: string | null;
  desc?: string | null;
  disabled?: boolean;
  access?: string | null;
  teachers?: IUser[] | null;
  students?: IUser[] | null;
  tags?: ICourseTag[] | null;
}

export interface ICourseProblem {
  _unittest?: boolean;
  _type?: IProblemType;
  type?: IProblemType;
  unittest?: boolean;
  _libname?: string | null;
  _files?: string[] | null;
  files?: string[] | null;
  id?: string | null;
  name?: string | null;
  cat?: string[] | null;

  /** @format double */
  timeout?: number;

  /** @format date-time */
  since?: string;
  _avail?: IDateTimeOrDays;

  /** @format date-time */
  avail?: string;
  _deadline?: IDateTimeOrDays;

  /** @format date-time */
  deadline?: string;
  assets?: string[] | null;
  export?: string[] | null;
  reference?: ICourseReference;
  tests?: ICourseProblemCase[] | null;
  collaboration?: ICourseProblemCollaborationConfig;
  statusCode?: IProblemStatus;
  status?: string | null;
  isActive?: boolean;
  groupsAllowed?: boolean;
  allTests?: ICourseProblemCase[] | null;
  description?: string | null;
  course?: string | null;
  year?: string | null;
}

export interface ICourseProblemApiListResponse {
  data?: ICourseProblem[] | null;
  errors?: IApiError[] | null;
}

export interface ICourseProblemCase {
  id?: string | null;

  /** @format int32 */
  size?: number;

  /** @format int32 */
  random?: number;

  /** @format double */
  timeout?: number;
  test?: string | null;
}

export interface ICourseProblemCollaborationConfig {
  enabled?: boolean;

  /** @format int32 */
  minSize?: number;

  /** @format int32 */
  maxSize?: number;
}

export interface ICourseReference {
  name?: string | null;
  lang?: string | null;
  hidden?: boolean;
}

export interface ICourseTag {
  name?: string | null;
  values?: string[] | null;
}

export interface ICourseYearConfig {
  year?: string | null;
  results?: ICcData[][] | null;
  problems?: ICourseProblem[] | null;
  settingsConfig?: ISettingsConfig;
}

export type IDateTimeOrDays = object;

export interface IDiffResultComposite {
  reference?: string | null;
  generated?: string | null;
  lines?: IDiffResultLine[] | null;
  error?: string | null;
  isOk?: boolean;
}

export interface IDiffResultLine {
  reference?: string | null;
  generated?: string | null;
  type?: IDiffResultLineType;
}

/**
 * @format int32
 */
export type IDiffResultLineType = 1 | 2;

export interface IGradeDto {
  result?: ICcDataDto;
  user?: IUser;
}

export interface ILineComment {
  text?: string | null;

  /** @format double */
  time?: number;
  user?: string | null;

  /** @format int32 */
  line?: number;
  filename?: string | null;
}

export interface IMarkSolutionItem {
  objectId?: string | null;

  /** @format float */
  points?: number;
  comment?: string | null;
}

export interface IObjectId {
  /** @format int32 */
  timestamp?: number;

  /** @format int32 */
  machine?: number;

  /** @format int32 */
  pid?: number;

  /** @format int32 */
  increment?: number;

  /** @format date-time */
  creationTime?: string;
}

/**
 * @format int32
 */
export type IProblemStatus = 0 | 1 | 2 | 3;

/**
 * @format int32
 */
export type IProblemType = 1 | 2 | 3;

export interface ISettingsConfig {
  teachers?: ISettingsConfigTeacher[] | null;
  allStudents?: IUser[] | null;
}

export interface ISettingsConfigTeacher {
  id?: string | null;
  tags?: string[] | null;
  students?: IUser[] | null;
  problems?: string[] | null;
}

export interface ISimpleFile {
  rawPath?: string | null;
  relPath?: string | null;
  filename?: string | null;
  isDir?: boolean;
  content?: any;
  files?: ISimpleFile[] | null;
}

export interface ISingleCourse {
  courseRef?: ICourse;
  course?: string | null;
  year?: string | null;
  courseConfig?: ICourseConfig;
  problems?: ICourseProblem[] | null;
  settingsConfig?: ISettingsConfig;
}

export interface ISingleCourseApiListResponse {
  data?: ISingleCourse[] | null;
  errors?: IApiError[] | null;
}

export interface IStudentScoreboardCourse {
  problem?: string | null;
  courseName?: string | null;
  courseYear?: string | null;

  /** @format date-time */
  since?: string;

  /** @format float */
  score?: number;
  objectId?: string | null;

  /** @format int32 */
  resultCount?: number;
  results?: ICcData[] | null;
  courseProblem?: ICourseProblem;
}

/**
 * @format int32
 */
export type ISubmissionStatus = 0 | 1 | 2 | 3;

export interface ITableRequest {
  /** @format int32 */
  pageSize?: number;

  /** @format int32 */
  page?: number;
  sorted?: ITableRequestSort[] | null;
  filtered?: ITableRequestFilter[] | null;
}

export interface ITableRequestFilter {
  id?: string | null;
  value?: string | null;
}

export interface ITableRequestSort {
  id?: string | null;
  desc?: boolean;
}

export interface ITableResponse {
  /** @format int64 */
  count?: number;
  data?: ICcDataDto[] | null;
}

export interface ITableResponseApiResponse {
  data?: ITableResponse;
  errors?: IApiError[] | null;
}

export interface IUser {
  id?: string | null;
  tags?: string[] | null;
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<FullRequestParams, "body" | "method" | "query" | "path">;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (securityData: SecurityDataType | null) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown> extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) => fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  private addQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  private addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return `${value.map(this.addQueryParam).join("&")}`;
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter((key) => "undefined" !== typeof query[key]);
    return keys
      .map((key) => (Array.isArray(query[key]) ? this.addArrayQueryParam(query, key) : this.addQueryParam(query, key)))
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string") ? JSON.stringify(input) : input,
    [ContentType.FormData]: (input: any) =>
      Object.keys(input || {}).reduce((data, key) => {
        data.append(key, input[key]);
        return data;
      }, new FormData()),
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  private mergeRequestParams(params1: RequestParams, params2?: RequestParams): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  private createAbortSignal = (cancelToken: CancelToken): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(`${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`, {
      ...requestParams,
      headers: {
        ...(type && type !== ContentType.FormData ? { "Content-Type": type } : {}),
        ...(requestParams.headers || {}),
      },
      signal: cancelToken ? this.createAbortSignal(cancelToken) : void 0,
      body: typeof body === "undefined" || body === null ? null : payloadFormatter(body),
    }).then(async (response) => {
      const r = response as HttpResponse<T, E>;
      r.data = (null as unknown) as T;
      r.error = (null as unknown) as E;

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title cc.net
 * @version 1.0
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  api = {
    /**
     * No description
     *
     * @tags ApiConfig
     * @name SaveGradeCreate
     * @request POST:/api/save-grade
     */
    saveGradeCreate: (data: IMarkSolutionItem, params: RequestParams = {}) =>
      this.request<any, any>({
        path: `/api/save-grade`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags ApiConfig
     * @name DiffDetail
     * @request GET:/api/diff/{objectId}/{caseId}
     */
    diffDetail: (objectId: string, caseId: string, params: RequestParams = {}) =>
      this.request<IDiffResultComposite, any>({
        path: `/api/diff/${objectId}/${caseId}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Comments
     * @name NotificationMarkAsReadDetail
     * @request GET:/api/notification/mark-as-read/{objectId}
     */
    notificationMarkAsReadDetail: (objectId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/notification/mark-as-read/${objectId}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Comments
     * @name CommentsCreate
     * @request POST:/api/comments
     */
    commentsCreate: (data: ICommentServiceItem[], params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/comments`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Courses
     * @name CourseListList
     * @request GET:/api/course-list
     */
    courseListList: (params: RequestParams = {}) =>
      this.request<ISingleCourseApiListResponse, any>({
        path: `/api/course-list`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Courses
     * @name CourseProblemListDetail
     * @request GET:/api/course-problem-list/{courseName}/{courseYear}
     */
    courseProblemListDetail: (courseName: string, courseYear: string, params: RequestParams = {}) =>
      this.request<ICourseProblemApiListResponse, any>({
        path: `/api/course-problem-list/${courseName}/${courseYear}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Courses
     * @name TestConfigDetail
     * @request GET:/api/test-config/{courseName}/{courseYear}
     */
    testConfigDetail: (courseName: string, courseYear: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/test-config/${courseName}/${courseYear}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Developer
     * @name RenameDetail
     * @request GET:/api/rename/{id}
     */
    renameDetail: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/rename/${id}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Grade
     * @name GradeStatsDetail
     * @request GET:/api/grade-stats/{courseName}/{year}/{problemId}
     */
    gradeStatsDetail: (courseName: string, year: string, problemId: string, params: RequestParams = {}) =>
      this.request<IGradeDto[], any>({
        path: `/api/grade-stats/${courseName}/${year}/${problemId}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Groups
     * @name StudentGroupNewCreate
     * @request POST:/api/student/group-new
     */
    studentGroupNewCreate: (data: ICcGroup, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/student/group-new`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Groups
     * @name StudentGroupStatusCreate
     * @request POST:/api/student/group-status
     */
    studentGroupStatusCreate: (data: ICcUserGroupUpdate, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/student/group-status`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Groups
     * @name StudentGroupEditCreate
     * @request POST:/api/student/group-edit
     */
    studentGroupEditCreate: (data: ICcGroup, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/student/group-edit`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Groups
     * @name StudentGroupList
     * @request GET:/api/student/group
     */
    studentGroupList: (params: RequestParams = {}) =>
      this.request<ICcGroup[], any>({
        path: `/api/student/group`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Groups
     * @name StudentGroupDeleteDetail
     * @request GET:/api/student/group-delete/{objectId}
     */
    studentGroupDeleteDetail: (objectId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/student/group-delete/${objectId}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Notifications
     * @name NotificationsGetList
     * @request GET:/api/notifications-get
     */
    notificationsGetList: (query?: { objectId?: string; path?: string }, params: RequestParams = {}) =>
      this.request<ICcEventApiListResponse, any>({
        path: `/api/notifications-get`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Results
     * @name ResultGetDetail
     * @request GET:/api/result-get/{objectId}
     */
    resultGetDetail: (objectId: string, params: RequestParams = {}) =>
      this.request<ICcDataApiResponse, any>({
        path: `/api/result-get/${objectId}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Results
     * @name FileGetDetail
     * @request GET:/api/file-get/{objectId}/{path}
     */
    fileGetDetail: (objectId: string, path: string, params: RequestParams = {}) =>
      this.request<any[], any>({
        path: `/api/file-get/${objectId}/${path}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Results
     * @name ReviewrequestDetail
     * @request GET:/api/reviewrequest/{objectId}
     */
    reviewrequestDetail: (objectId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/reviewrequest/${objectId}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Results
     * @name ReviewrequestDelete
     * @request DELETE:/api/reviewrequest/{objectId}
     */
    reviewrequestDelete: (objectId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/reviewrequest/${objectId}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Results
     * @name UserProblemResultsDetail
     * @request GET:/api/user-problem-results/{courseName}/{courseYear}/{problem}/{user}
     */
    userProblemResultsDetail: (
      courseName: string,
      courseYear: string,
      problem: string,
      user: string,
      params: RequestParams = {},
    ) =>
      this.request<ICcDataApiListResponse, any>({
        path: `/api/user-problem-results/${courseName}/${courseYear}/${problem}/${user}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Results
     * @name UserProblemResultsLightDetail
     * @request GET:/api/user-problem-results-light/{courseName}/{courseYear}/{problem}/{user}
     */
    userProblemResultsLightDetail: (
      courseName: string,
      courseYear: string,
      problem: string,
      user: string,
      params: RequestParams = {},
    ) =>
      this.request<ICcDataLightApiListResponse, any>({
        path: `/api/user-problem-results-light/${courseName}/${courseYear}/${problem}/${user}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Scoreboard
     * @name StudentScoreboardList
     * @request GET:/api/student-scoreboard
     */
    studentScoreboardList: (params: RequestParams = {}) =>
      this.request<IStudentScoreboardCourse[], any>({
        path: `/api/student-scoreboard`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Stats
     * @name StatsAllStatsList
     * @request GET:/api/stats/all-stats
     */
    statsAllStatsList: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/stats/all-stats`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Teacher
     * @name RerunSolutionDetail
     * @request GET:/api/rerun-solution/{objectId}
     */
    rerunSolutionDetail: (objectId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/rerun-solution/${objectId}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags ViewResult
     * @name ViewResultsCreate
     * @request POST:/api/view-results
     */
    viewResultsCreate: (data: ITableRequest, params: RequestParams = {}) =>
      this.request<ITableResponseApiResponse, any>({
        path: `/api/view-results`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  staticFiles = {
    /**
     * No description
     *
     * @tags DirectoryBrowser
     * @name ServeDetail
     * @request GET:/static-files/serve/{path}
     */
    serveDetail: (path: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/static-files/serve/${path}`,
        method: "GET",
        ...params,
      }),
  };
  home = {
    /**
     * No description
     *
     * @tags Home
     * @name WhoamiList
     * @request GET:/home/whoami
     */
    whoamiList: (params: RequestParams = {}) =>
      this.request<IAppUser, any>({
        path: `/home/whoami`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Home
     * @name IndexList
     * @request GET:/home/index
     */
    indexList: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/home/index`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Home
     * @name LoginList
     * @request GET:/home/login
     */
    loginList: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/home/login`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Home
     * @name LogoutList
     * @request GET:/home/logout
     */
    logoutList: (params: RequestParams = {}) =>
      this.request<boolean, any>({
        path: `/home/logout`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Home
     * @name LoginDetail
     * @request GET:/home/login/{path}
     */
    loginDetail: (path: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/home/login/${path}`,
        method: "GET",
        ...params,
      }),
  };
  webhook = {
    /**
     * No description
     *
     * @tags Webhook
     * @name UpdateCreate
     * @request POST:/webhook/update
     */
    updateCreate: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/webhook/update`,
        method: "POST",
        ...params,
      }),
  };
}
