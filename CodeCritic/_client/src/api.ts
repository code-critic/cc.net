import axios from 'axios';
import { Api } from './cc-api';
import { IApiListResponse, IApiResponse } from './models/CustomModel';
import { ICcData, ICcDataLight } from './models/DataModel';
import { notifications } from './utils/notifications';

export const API = axios
    .create({
        baseURL: `/api/`,
    });

interface IErrorResponse {
    error: any;
    hasError: boolean;
}

const ErrorResponse = (error: any) => {
    return {
        error, hasError: true
    };
}

export const AApi = new Api();


const _resultCache = new Map<string, any>();
(window as any)._resultCache = _resultCache;

async function _catchPromise<T>(promise: Promise<T>): Promise<T | IErrorResponse> {
    try {
        return await promise;
    } catch (error) {
        notifications.error(`Error occured: ${error}`);
        return ErrorResponse(error);
    }
}

export const APIResult = {

    get: (objectId: string) => {
        return new Promise<ICcData>(async (resolve, reject) => {
            if (_resultCache.has(objectId)) {
                resolve(_resultCache.get(objectId) as ICcData);
            } else {
                try {
                    const axiosReponse = await API.get<IApiResponse<ICcData>>(`result-get/${objectId}`);
                    const result = axiosReponse.data.data;
                    // _resultCache.set(objectId, result);
                    resolve(result);
                } catch (error) {
                    notifications.error(`Error while loading data: ${error}`);
                    reject(error);
                }
            }
        });
    },

    cancelCodeReview: async (result: ICcData | ICcDataLight) => {
        const resp = await _catchPromise(API.delete(`reviewrequest/${result.objectId}`));
        _resultCache.delete(result.objectId);
        

        if (!('hasError' in resp)) {
            notifications.success(`Ok, cancelled`);
            return true;
        }
        return false;
    },

    requestCodeReview: async (result: ICcData | ICcDataLight) => {
        const resp = await _catchPromise(API.get(`reviewrequest/${result.objectId}`));
        _resultCache.delete(result.objectId);

        if (!('hasError' in resp)) {
            notifications.success(`Ok, teacher notified!`);
            return true;
        }
        return false;
    },

    set: (objectId: string, result: ICcData) => {
        _resultCache.set(objectId, result);
    }
}
