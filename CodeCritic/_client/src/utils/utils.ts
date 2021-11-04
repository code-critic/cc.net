import { notifications } from "./notifications";

export const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const hubException = (e: any) => {
    const hubExceptionPart = "HubException:";
    const error = e.toString();
    const index = error.indexOf(hubExceptionPart);
    
    notifications.error(
        index != -1
            ? error.substr(index + hubExceptionPart.length)
            : error
    );
}

export const getInitials = (name: string) => (name || "")
    .split(".", 2)
    .map(i => i.charAt(0))
    .join("")
    .toUpperCase();
    
export const humanizeName = (name: string) => (name || "")
    .split(".")
    .map(i => i.charAt(0).toUpperCase() + i.substr(1))
    .join(" ")
    .replaceAll(/\d/g, "");


export function last<T>(iterable: T[]) {
    return iterable[iterable.length-1];
};

export const normalizePath = (path: string) => {
    if (path.startsWith("/")) {
        return path;
    }
    return `/${path}`;
}