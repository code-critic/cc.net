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

export interface IAdminResponse {
  ok?: boolean;
  message?: string | null;
}

export interface IApiError {
  name?: string | null;
  errors?: string[] | null;
}

export interface IAppUser {
  eppn?: string | null;
  affiliation?: string | null;
  datetime?: string | null;
  role?: string | null;
  serverStatus?: string | null;
  serverMessage?: string | null;
  version?: string | null;
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

  /** @format double */
  timeLimit?: number;
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

  /** @format double */
  timeLimit?: number;
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

export interface IChangeServerStateRequest {
  password?: string | null;
  newState?: string | null;
  message?: string | null;
}

/**
 * @format int32
 */
export type IChangeType = 0 | 1 | 2 | 3 | 4;

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

/**
 * @format int32
 */
export type ICourseAccess = 1 | 2;

export interface ICourseConfig {
  name?: string | null;
  desc?: string | null;
  disabled?: boolean;
  access?: string | null;
  teachers?: IUser[] | null;
  students?: IUser[] | null;
  tags?: ICourseTag[] | null;
}

export interface ICourseConfigDto {
  name?: string | null;
  desc?: string | null;
  disabled?: boolean;
  access?: ICourseAccess;
  courses?: ICourseYearDto[] | null;
  errors?: string[] | null;
}

export interface ICourseConfigDtoApiListResponse {
  data?: ICourseConfigDto[] | null;
  errors?: IApiError[] | null;
}

export type ICourseGroup = object;

export interface ICourseProblem {
  type?: IProblemType;
  files?: string[] | null;
  id?: string | null;
  name?: string | null;
  cat?: string[] | null;
  section?: string | null;

  /** @format double */
  timeout?: number;

  /** @format date-time */
  since?: string;

  /** @format date-time */
  avail?: string;

  /** @format date-time */
  deadline?: string;
  assets?: string[] | null;
  export?: string[] | null;
  reference?: ICourseReference;
  unittest: IUnitTest[];
  tests?: ICourseProblemCase[] | null;
  collaboration?: ICourseProblemCollaborationConfig;
  statusCode?: IProblemStatus;
  isActive?: boolean;
  groupsAllowed?: boolean;
  description?: string | null;
  complexDescriptionPage?: string | null;
  course?: string | null;
  year?: string | null;
}

export interface IUnitTest {
  entrypoint?: string;
  libname?: string;
  lang?: string;
  hidden?: boolean;
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
  problems?: ICourseProblem[] | null;
  settingsConfig?: ISettingsConfig;
  courseGroup?: ICourseGroup;
}

export interface ICourseYearDto {
  course?: string | null;
  year?: string | null;
  teachers?: ISettingsConfigTeacher[] | null;
  problems?: IProblemDto[] | null;
}

export interface IDiffPaneModel {
  lines?: IDiffPiece[] | null;
}

export interface IDiffPiece {
  type?: IChangeType;

  /** @format int32 */
  position?: number | null;
  text?: string | null;
  subPieces?: IDiffPiece[] | null;
}

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

export interface IGradeStatFilterDto {
  showMissingGradeOnly?: boolean;
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

export interface IPlagResult {
  aId?: string | null;
  bId?: string | null;
  aName?: string | null;
  bName?: string | null;
  language?: string | null;
  diffs?: ISideBySideDiff[] | null;

  /** @format int32 */
  equalLines?: number;

  /** @format int32 */
  totalLines?: number;

  /** @format double */
  similarity?: number;
}

export interface IProblemDto {
  course?: string | null;
  year?: string | null;
  problem?: string | null;
  config?: ICourseProblem;
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

export interface ISideBySideDiff {
  a?: string | null;
  b?: string | null;
  diff?: ISideBySideDiffModel;
}

export interface ISideBySideDiffModel {
  oldText?: IDiffPaneModel;
  newText?: IDiffPaneModel;
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

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, ResponseType } from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<FullRequestParams, "body" | "method" | "query" | "path">;

export interface ApiConfig<SecurityDataType = unknown> extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({ securityWorker, secure, format, ...axiosConfig }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({ ...axiosConfig, baseURL: axiosConfig.baseURL || "" });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  private mergeRequestParams(params1: AxiosRequestConfig, params2?: AxiosRequestConfig): AxiosRequestConfig {
    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.instance.defaults.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  private createFormData(input: Record<string, unknown>): FormData {
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      formData.append(
        key,
        property instanceof Blob
          ? property
          : typeof property === "object" && property !== null
          ? JSON.stringify(property)
          : `${property}`,
      );
      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = (format && this.format) || void 0;

    if (type === ContentType.FormData && body && body !== null && typeof body === "object") {
      requestParams.headers.common = { Accept: "*/*" };
      requestParams.headers.post = {};
      requestParams.headers.put = {};

      body = this.createFormData(body as Record<string, unknown>);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(type && type !== ContentType.FormData ? { "Content-Type": type } : {}),
        ...(requestParams.headers || {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title cc.net
 * @version 1.0
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  admin = {
    /**
     * No description
     *
     * @tags Admin
     * @name ChangeServerStateCreate
     * @request POST:/admin/change-server-state
     */
    changeServerStateCreate: (data: IChangeServerStateRequest, params: RequestParams = {}) =>
      this.request<IAdminResponse, any>({
        path: `/admin/change-server-state`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
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
     * @name UserCoursesList
     * @request GET:/api/user-courses
     * @deprecated
     */
    userCoursesList: (params: RequestParams = {}) =>
      this.request<ICourseConfigDtoApiListResponse, any>({
        path: `/api/user-courses`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Courses
     * @name UserProblemsDetail
     * @request GET:/api/user-problems/{courseName}/{courseYear}
     */
    userProblemsDetail: (courseName: string, courseYear: string, params: RequestParams = {}) =>
      this.request<IProblemDto[], any>({
        path: `/api/user-problems/${courseName}/${courseYear}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Courses
     * @name UserProblemDetail
     * @request GET:/api/user-problem/{courseName}/{courseYear}/{problem}
     */
    userProblemDetail: (courseName: string, courseYear: string, problem: string, params: RequestParams = {}) =>
      this.request<IProblemDto, any>({
        path: `/api/user-problem/${courseName}/${courseYear}/${problem}`,
        method: "GET",
        format: "json",
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
     * @deprecated
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
     * @name GradeStatsCreate
     * @request POST:/api/grade-stats/{courseName}/{year}/{problemId}
     */
    gradeStatsCreate: (
      courseName: string,
      year: string,
      problemId: string,
      data: IGradeStatFilterDto,
      params: RequestParams = {},
    ) =>
      this.request<IGradeDto[], any>({
        path: `/api/grade-stats/${courseName}/${year}/${problemId}`,
        method: "POST",
        body: data,
        type: ContentType.Json,
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
     * @tags Plagiarism
     * @name PlagTwoDetail
     * @request GET:/api/plag-two/{aId}/{bId}
     */
    plagTwoDetail: (aId: string, bId: string, params: RequestParams = {}) =>
      this.request<IPlagResult, any>({
        path: `/api/plag-two/${aId}/${bId}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Plagiarism
     * @name PlagAllDetail
     * @request GET:/api/plag-all/{courseName}/{courseYear}/{problem}
     */
    plagAllDetail: (courseName: string, courseYear: string, problem: string, params: RequestParams = {}) =>
      this.request<IPlagResult[], any>({
        path: `/api/plag-all/${courseName}/${courseYear}/${problem}`,
        method: "GET",
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
