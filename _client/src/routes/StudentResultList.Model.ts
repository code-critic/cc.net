import { observable, action } from "mobx"
import "react-table/react-table.css";
import { httpClient } from "../init";
import { ICcData, ILanguage, ITableRequestSort, ITableRequestFilter, ITableResponse, ICourse } from "../models/DataModel";
import { ApiResource } from "../utils/ApiResource";


export class StudentResultListModel {
    @observable public dataIsLoading: boolean = true;
    @observable public detailObjectId: string = "";

    public data: ICcData[] = [];
    public pages: number = 666;
    public courses: ApiResource<ICourse> = new ApiResource<ICourse>("courses");
    public languages: ApiResource<ILanguage> = new ApiResource<ILanguage>("languages");

    public get apiIsLoading () {
        return this.courses.isLoading || this.languages.isLoading;
    }

    @action.bound
    public load(pageSize: number, page: number, sorted: ITableRequestSort[], filtered: ITableRequestFilter[]) {
        this.dataIsLoading = true;
        httpClient.fetch("student-result-list", { pageSize, page, sorted, filtered })
            .catch(e => console.error(e))
            .then((res: ITableResponse) => {
                this.data = res.data as ICcData[];
                this.pages = Math.ceil(res.count / pageSize);
                this.dataIsLoading = false;
            });
    }

    constructor() {
        this.languages.load();
        this.courses.load();
    }
}