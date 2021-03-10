import { action, observable } from "mobx";
import "react-table/react-table.css";
import { httpClient } from "../init";
import { ICcData, ICourse, ILanguage, ITableRequestFilter, ITableRequestSort, ITableResponse } from "../models/DataModel";
import { ApiResource } from "../utils/ApiResource";


export class StudentResultListModel {
    @observable public dataIsLoading: boolean = true;

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
}