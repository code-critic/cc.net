import { httpClient } from "../init";
import { observable } from "mobx";

export class ApiResource<T> {


    public data: T[] = [];

    @observable public isLoading: boolean = false;

    public isLoaded: boolean = false;


    public static load<T>(path: string): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            new ApiResource<T>(path, false).load()
            .then(data => {
                resolve(data as any);
            })
            .catch(reject);
        });
    }
    constructor(public path: string, autoload = true) {
        if (autoload) {
            this.load();
        }
    }

    public loadState(callback: (data: T[]) => void, path?: string) {
        if (this.isLoaded) {
            return;
        } else {
            this.load(path)
                .then((data) => callback(data));
        }
    }

    public load(path?: string): Promise<T[]> {
        if (this.isLoaded) {
            return new Promise((resolve, reject) => resolve(this.data));
        }

        if (this.isLoading) {
            return new Promise((resolve, reject) => { }); // too late to return the promise
        }

        this.isLoading = true;

        return new Promise((resolve, reject) => {
            httpClient.fetch(path || this.path)
                .catch(e => {
                    reject(e);
                })
                .then((data: T[]) => {
                    this.data = data;
                    this.isLoading = false;
                    this.isLoaded = true;
                    resolve(data);
                });
        });
    }
}