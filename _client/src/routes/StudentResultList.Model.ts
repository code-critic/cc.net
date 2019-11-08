import { observable, action } from "mobx"
import "react-table/react-table.css";
import { httpClient } from "../init";


export class StudentResultListModel {
    @observable public dataIsLoading: boolean = true;
    @observable public apiIsLoading: boolean = true;
    @observable public detailObjectId: string = "";

    public data: ICcData[] = [];
    public pages: number = 666;
    public languages: ILanguage[] = [];

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

    @action.bound
    private loadLanguages() {
        this.apiIsLoading = true;
        httpClient.fetch("languages")
            .then((data: ILanguage[]) => {
                this.languages = data;
                this.apiIsLoading = false;
            });
    }

    constructor() {
        this.loadLanguages();
    }
}