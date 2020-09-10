import React, { useState, useEffect } from 'react';
import * as H from 'history';
import { ICcData, ILanguage } from '../models/DataModel';
import { SimpleLoader } from './SimpleLoader';
import { ApiResource } from '../utils/ApiResource';
import { StudentResultItem } from './StudentResults.Item';
import { commentService, appDispatcher } from '../init';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';

import DeleteForeverOutlinedIcon from '@material-ui/icons/DeleteForeverOutlined';
import { AlertDialog } from './AlertDialog';

interface SingleResultProps {
    history: H.History;
    match: Match<ParamsProps>;
}

interface ParamsProps {
    objectId: string;
}


interface Match<P> {
    params: P;
    isExact: boolean;
    path: string;
    url: string;
}

export const SingleResult = (props: SingleResultProps) => {
    const { match } = props;

    const [result, setResult] = useState<ICcData>();
    const [languages, setLanguages] = React.useState<ILanguage[]>([]);
    const [items, setItems] = React.useState(commentService.items);
    const [discardDialog, setDiscardDialog] = React.useState(false);

    appDispatcher.register((payload: any) => {
        if (payload.actionType == "commentServiceChanged") {
            setItems([...commentService.items]);
            setResult(undefined);
        }
    });

    useEffect(() => {
        if (!result) {
            new ApiResource<ICcData>(`result/${match.params.objectId}`, false)
                .load()
                .then(data => {
                    setResult(data as any);
                })

            new ApiResource<ILanguage>("languages", false).load()
                .then(setLanguages);
        }
    }, [result]);


    if (!result) {
        return <SimpleLoader />
    }

    return <>
        <div>
            {items.length > 0 &&
                <ButtonGroup variant="contained" color="primary">
                    <Button onClick={() => commentService.postComments()}>
                        Add {items.length} comment{items.length > 1 ? "s" : ""}
                    </Button>
                    <Button color="secondary" onClick={() => setDiscardDialog(true)}>
                        <DeleteForeverOutlinedIcon />
                    </Button>
                    {discardDialog &&
                        <AlertDialog
                            title="Confirm"
                            message="Do you really want to discard prepared comments?"
                            onClose={() => setDiscardDialog(false)}
                            onConfirm={() => commentService.discardComments()} />
                    }
                </ButtonGroup>}
        </div>
        <StudentResultItem key={result.objectId}
            item={result}
            languages={languages}
            forceOpen={true}
        />
    </>
}