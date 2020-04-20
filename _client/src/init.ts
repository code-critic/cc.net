import { ILineComment, ICcData } from "./models/DataModel";
import { observable } from "mobx";
import { Dispatcher } from 'flux';

interface HttpClientConfig {
    baseUrl: string;
    headers: { [key: string]: string };
}

class HttpClient {
    constructor(private config: HttpClientConfig) {
    }

    public fetch(url: string, data: any = null, method: string = "auto"): Promise<object | any> {
        const headers = this.config.headers || {};
        const body = data === null ? null : JSON.stringify(data);
        method = method === "auto" ? (data === null ? "get" : "post") : method;
        return new Promise((resolve, reject) => {
            fetch(`${this.config.baseUrl}${url}`, { method, headers, body })
                .then(result => result.json())
                .catch(reason => reject(reason))
                .then(data => resolve(data))
                .catch(reason => reject(reason))
        });
    }
}


export interface CommentServiceItem {
    comment: ILineComment;
    result: ICcData;
}

class CommentService {

    @observable
    public items: CommentServiceItem[] = [];

    public prepareComment(item: CommentServiceItem) {
        this.items.push(item);
        appDispatcher.dispatch({
            actionType: "commentServiceChanged"
        });
    }
}

export class LayoutUtils {
    public onChange?: (style: string) => void;

    public className: string = "";
    public setContainerStyle(style: string) {
        this.className = style

        if (this.onChange) {
            this.onChange(this.className);
        }
    }
}

export const httpClient = new HttpClient({
    baseUrl: 'api/',
    headers: {
        'Content-Type': 'application/json'
    },
});

export const User = {
    id2: "jan.hybs",
    id: "michal.dvorak",
    name: "Jan Hybš",
    role: "root"
};

export const layoutUtils = new LayoutUtils();


window.addEventListener("keypress", event => {
    if (!(event.which == 115 && event.ctrlKey) && !(event.which == 19)) return true
    alert("Ctrl-S pressed");
    event.preventDefault();
    return false;
});


export const commentService = new CommentService();

export const appDispatcher = new Dispatcher();