import { ICcEvent } from "../models/DataModel";
import { groupBy } from "./arrayUtils";

export const reduceNotifications = (data: ICcEvent[]) => {
    const result: ICcEvent[] = [];
    const notificationGroups = groupBy(data, i => `${i.resultObjectId}:${i.type}`);
    notificationGroups.forEach(i => {
        const top = i.sort((a, b) => b.id.timestamp - a.id.timestamp)[0];
        const ccEvent: ICcEvent = {...top};
        ccEvent.isNew = i.some(j => j.isNew);
        result.push(ccEvent);
    });

    const groups = result.sort((a, b) => Number(b.isNew) - Number(a.isNew));
    const newCount = groups.filter(i => i.isNew).length;

    // const { groups, newCount } = reduceNotifications();
    return { groups, newCount };
}