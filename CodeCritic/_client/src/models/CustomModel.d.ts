import { IApiError } from './DataModel';

interface IApiResponse<T> {
    data: T,
    errors: IApiError[]
}

interface IApiListResponse<T> {
    data: T[],
    errors: IApiError[]
}

export type OptionType = {
    name: string;
    value: any;
};
