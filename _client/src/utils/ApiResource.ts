import { observable, action } from "mobx";
import { httpClient } from "../init";

export class ApiResource<T> {


    public data: T[] = [];

    @observable public isLoading: boolean = false;


    constructor(public path: string, autoload = true) {
        if (autoload) {
            this.load();
        }
    }

    @action.bound
    public load(path?: string): Promise<T[]> {
        if (this.isLoading) {
            return new Promise((resolve, reject) => {}); // too late to return the promise
        }
        
        this.isLoading = true;

        return new Promise((resolve, reject) => {
            httpClient.fetch(path || this.path)
                .catch(e => {
                    reject(e);
                })
                .then((data: T[]) => {
                    this.data = data;
                    resolve(data);
                    this.isLoading = false;
                });
        });
    }
}