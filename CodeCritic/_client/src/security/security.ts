import { IAppUser } from "../cc-api";

export const guest: IAppUser = {
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
    groups: [],
    isCurrentlyRoot: false,
}

export const getLocalStorageUserOrDefault = () => {
    if ('user' in localStorage) {
        const data = JSON.parse(localStorage.getItem('user'));
        return data as IAppUser;
    }
    
    return {...guest};
}

export const isUserEqual = (a: IAppUser, b:IAppUser) => {
    return JSON.stringify(a) == JSON.stringify(b);
}