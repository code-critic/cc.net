
export interface HttpClientConfig {
    baseUrl: string;
    headers: { [key: string]: string };
}

export class HttpClient {
    constructor(private config: HttpClientConfig) {
    }

    public fetch(url: string, data: any = null, method: string = "auto"): Promise<object | any> {
        const headers = this.config.headers || {};
        const body = data === null ? null : JSON.stringify(data);
        method = method === "auto" ? (data === null ? "get" : "post") : method;
        return new Promise((resolve, reject) => {
            fetch(`${this.config.baseUrl}${url}`, {method, headers, body})
                .then(result => result.json())
                .catch(reason => reject(reason))
                .then(data => resolve(data))
                .catch(reason => reject(reason))
        });
    }
}

export const httpClient = new HttpClient({
    baseUrl: 'api/',
    headers: {
        'Content-Type': 'application/json'
    },
});