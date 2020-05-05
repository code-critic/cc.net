import { ILineComment, ICcData, ICommentServiceItem } from "./models/DataModel";
import { observable } from "mobx";
import { Dispatcher } from 'flux';
import { HubConnectionBuilder } from '@aspnet/signalr';
import { NotificationManager } from 'react-notifications';

interface HttpClientConfig {
    baseUrl: string;
    headers: { [key: string]: string };
}

class HttpClient {

    private cache: Map<string, any> = new Map();
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

    public fetchWithCache(url, ttl: number=5): Promise<any> {
        const item = this.cache.get(url);
        if (item != null) {
            if (item.validUntil.getTime() > new Date().getTime()) {
                return new Promise((resolve, reject) => {
                    resolve(item.content);
                });
            } else {
                this.cache.delete(url);
            }
        }
        return new Promise((resolve, reject) => {
            this.fetch(url)
                .then(data => {
                    this.cache.set(url, {
                        content: data,
                        validUntil: new Date(new Date().getTime() + 1000 * 60 * ttl)
                    });
                    resolve(data);
                })
                .catch(reason => reject(reason))
        });
    }
}


class CommentService {

    @observable
    public items: ICommentServiceItem[] = [];

    public prepareComment(item: ICommentServiceItem) {
        this.items.push(item);
        appDispatcher.dispatch({
            actionType: "commentServiceChanged"
        });
    }

    public discardComments() {
        this.items = [];
        appDispatcher.dispatch({
            actionType: "commentServiceChanged"
        });
    }

    public postComments() {
        if (!this.items.length) {
            return;
        }

        const recovery = this.items;
        httpClient.fetch("comments", this.items, "post")
            .then(data => {
                const { status, updated } = data;
                if(status === "ok") {
                    NotificationManager.success(`Ok, Saved ${updated} comments`);
                } else {
                    NotificationManager.error(`Failed to save ${recovery.length} comments`);
                }
                
            });

        this.items = [];
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

export const liveConnection = new HubConnectionBuilder()
    .withUrl("/live")
    .build();


type NotificationLevel = "info" | "success" | "warning" | "error";

liveConnection.start()
    .then(() => {

        console.log("Connected to the hub");

        (window as any).foo = liveConnection;
        liveConnection.invoke("RegisterUser", User.id);
        console.log((window as any).foo);


        liveConnection.on("OnMessage", (message: string, level: NotificationLevel) => {
            switch (level) {
                case "info":
                    NotificationManager.info(message.toString());
                    break;
                case "success":
                    NotificationManager.success(message.toString());
                    break;
                case "warning":
                    NotificationManager.warning(message.toString());
                    break;
                case "error":
                    NotificationManager.error(message.toString());
                    break;
            }
        });
    });
