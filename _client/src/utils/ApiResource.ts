import { observable, action } from "mobx";
import { httpClient } from "../init";

export class ApiResource<T> {

    public data: T[] = [];

    @observable public isLoading: boolean = true;

    constructor(public path: string) { }

    @action.bound
    public load() {
        this.isLoading = true;
        httpClient.fetch(this.path)
            .then((data: T[]) => {
                this.data = data;
                this.isLoading = false;
            });
    }
}