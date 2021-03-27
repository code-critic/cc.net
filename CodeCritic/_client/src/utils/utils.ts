import { NotificationManager } from 'react-notifications';

export const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const hubException = (e: any) => {
    const hubExceptionPart = "HubException:";
    const error = e.toString();
    const index = error.indexOf(hubExceptionPart);
    
    NotificationManager.error(
        index != -1
            ? error.substr(index + hubExceptionPart.length)
            : error
    );
}

export const getInitials = (name) => (name || "")
    .split(".", 2)
    .map(i => i.charAt(0))
    .join("")
    .toUpperCase();