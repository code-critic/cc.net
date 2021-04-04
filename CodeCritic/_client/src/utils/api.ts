import { API } from "../api";
import { ICcData } from "../models/DataModel";
import { notifications } from "./notifications";

export const requestCodeReview = async (result: ICcData) => {
    try {
        await API.get(`reviewrequest/${result.objectId}`);
        notifications.success(`Ok, teacher notified!`);
        return true;
    } catch (error) {
        notifications.error(`There was an error: ${error}`);
        return false;
    }
}

export const cancelCodeReview = async (result: ICcData) => {
    try {
        await API.delete(`reviewrequest/${result.objectId}`);
        notifications.info(`Ok, cancelled`);
        return true;
    } catch (error) {
        notifications.error(`There was an error: ${error}`);
        return false;
    }
}