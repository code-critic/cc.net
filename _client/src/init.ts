import { ICommentServiceItem, IAppUser, ICcEvent } from "./models/DataModel";
import { observable } from "mobx";
import { Dispatcher } from 'flux';
import { HubConnectionBuilder, LogLevel } from '@aspnet/signalr';
import { NotificationManager } from 'react-notifications';
import { auth } from './auth';
import { sleep } from "./utils/utils";

// console.log('init auth');
// await auth();
// console.log('init auth end');

interface HttpClientConfig {
    baseUrl: string;
    headers: { [key: string]: string };
}

type methodType = "auto" | "get" | "post" | "delete" | "put" | "patch";

class HttpClient {

    private cache: Map<string, any> = new Map();
    constructor(private config: HttpClientConfig) {
    }

    public fetch(url: string, data: any = null, method: methodType = "auto"): Promise<object | any> {
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

    public fetchSlow(url: string, data: any = null, method: methodType = "auto", timeout=1000): Promise<object | any> {
        return new Promise((resolve, reject) => {
            this.fetch(url, data, method)
                .then(async d => {
                    await sleep(timeout);
                    resolve(d);
                });
        });
    }

    public fetchWithCache(url, ttl: number = 5): Promise<any> {
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
    public markAsRead(event: ICcEvent) {
        httpClient.fetch(`notification/mark-as-read/${event.objectId}`)
            .then(i => {
                console.log(i);
            });
    }

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
                if (status === "ok") {
                    NotificationManager.success(`Ok, Saved ${updated} comments`);
                } else {
                    NotificationManager.error(`Failed to save ${recovery.length} comments`);
                }

                this.items = [];
                appDispatcher.dispatch({
                    actionType: "commentServiceChanged"
                });
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

let _currentUser: IAppUser = {
    affiliation: "guest",
    datetime: "guest",
    email: "guest@tul.cz",
    eppn: "guest",
    id: "guest",
    isRoot: false,
    lastFirstName: "guest guest",
    role: null as any,
    roles: [],
    username: "guest",
}
export const getUser = () => _currentUser;
export const userIsRoot = () => _currentUser.role === "root";

export const userCanBeRoot = () => _currentUser.roles.indexOf("root") !== -1;

export const updateUser = (user: IAppUser) => {
    _currentUser = user;
    appDispatcher.dispatch({ actionType: "userChanged" });
}

export const layoutUtils = new LayoutUtils();


window.addEventListener("keypress", event => {
    if (!(event.which == 115 && event.ctrlKey) && !(event.which == 19)) return true
    alert("Ctrl-S pressed");
    event.preventDefault();
    return false;
});


export type DispatcherActionType = 'userChanged' | 'commentServiceChanged' | 'newNotification' | 'serverStateChanged' | 'queueStatus';
export interface IDispatcher {
    actionType: DispatcherActionType;
    data?: any;
}


export const commentService = new CommentService();
export const appDispatcher = new Dispatcher<IDispatcher>();
export const liveConnection = new HubConnectionBuilder()
    .withUrl("/live")
    .configureLogging(LogLevel.None)
    .build();

const startWS = () => {
    appDispatcher.dispatch({
        actionType: "serverStateChanged",
        data: "connecting",
    });
    liveConnection.start()
        .then(() => {
            appDispatcher.dispatch({
                actionType: "serverStateChanged",
                data: "connected",
            });
            console.log("Connected to the hub");
            (window as any).foo = liveConnection;
            liveConnection.invoke("RegisterUser", _currentUser.id);

            liveConnection.on("newNotification", payload => {
                appDispatcher.dispatch({
                    actionType: "newNotification",
                    data: payload
                })
            });

            liveConnection.on("queueStatus", payload => {
                appDispatcher.dispatch({
                    actionType: "queueStatus",
                    data: payload
                })
            });

            liveConnection.on("serverMessage", (level: NotificationLevel, message: string, title:string = "", timeOut: number = 400) => {
                switch (level) {
                    case "info":
                        NotificationManager.info(message.toString(), title, timeOut);
                        break;
                    case "success":
                        NotificationManager.success(message.toString(), title, timeOut);
                        break;
                    case "warning":
                        NotificationManager.warning(message.toString(), title, timeOut);
                        break;
                    case "error":
                        NotificationManager.error(message.toString(), title, timeOut);
                        if (title === "Server shutting down") {
                            setTimeout(() => {
                                window.location.reload();
                            }, timeOut);
                        }
                        break;
                }
            });
        })
        .catch(error => {
            appDispatcher.dispatch({
                actionType: "serverStateChanged",
                data: "closed",
            });
            setTimeout(() => {
                startWS();
            }, 5000);
        })

    liveConnection.onclose(error => {
        appDispatcher.dispatch({
            actionType: "serverStateChanged",
            data: "closed",
        });
        setTimeout(() => {
            startWS();
        }, 5000);
    });
}


type NotificationLevel = "info" | "success" | "warning" | "error";

auth()
    .then(i => {
        _currentUser = (window as any).currentUser as IAppUser;
        appDispatcher.dispatch({ actionType: "userChanged" });
        startWS();
    });