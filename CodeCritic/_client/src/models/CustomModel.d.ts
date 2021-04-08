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

export interface ILanguage {
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

export interface ISimpleFileDto {
    content: string;
    name: string;
    path: string;
}