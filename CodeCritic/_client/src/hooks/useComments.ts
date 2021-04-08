import { useEffect, useState } from 'react';

import { appDispatcher, commentService } from '../init';
import { ICommentServiceItem } from '../cc-api';

export const useComments = () => {
    const [serviceItems, setServiceItems] = useState<ICommentServiceItem[]>([]);

    useEffect(() => {
        const id = appDispatcher.register(payload => {
            switch (payload.actionType) {
                case "commentServiceChanged":
                    setServiceItems([...commentService.items]);
                    break;
            }
        });
        
        return () => {
            appDispatcher.unregister(id);
        }
    }, []);


    // const { comments, prepareComment, postComments, postCommentsAsync } = useComments();
    return {
        serviceItems,
        comments: serviceItems.map(i => i.comment),
        prepareComment: (item:ICommentServiceItem) => commentService.prepareComment(item), 
        postComments: () => commentService.postComments(),
        postCommentsAsync: () => commentService.postCommentsAsync()
     };
}