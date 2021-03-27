import { IAppUser } from "../models/DataModel";

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