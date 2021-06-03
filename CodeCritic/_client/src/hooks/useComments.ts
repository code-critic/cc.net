import { useEffect, useState } from 'react';

import { ICommentServiceItem } from '../cc-api';
import { appDispatcher, commentService } from '../init';

export const useComments = () => {
    const [ serviceItems, setServiceItems ] = useState<ICommentServiceItem[]>(commentService.items);

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

    const cancelComment = (item: ICommentServiceItem) => {
        const newItems = commentService.items
            .filter(i => !(i.objectId == item.objectId
                && i.comment.filename == item.comment.filename
                && i.comment.text == item.comment.text
                && i.comment.line == item.comment.line));

                
        commentService.items = newItems;
        appDispatcher.dispatch({
            actionType: "commentServiceChanged"
        });
    }


    // const { comments, prepareComment, postComments, postCommentsAsync } = useComments();
    return {
        serviceItems, cancelComment,
        comments: serviceItems.map(i => i.comment),
        prepareComment: (item: ICommentServiceItem) => commentService.prepareComment(item), 
        postComments: () => commentService.postComments(),
        postCommentsAsync: () => commentService.postCommentsAsync()
     };
}