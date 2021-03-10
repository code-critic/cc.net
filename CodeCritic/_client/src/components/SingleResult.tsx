import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import DeleteForeverOutlinedIcon from '@material-ui/icons/DeleteForeverOutlined';
import * as H from 'history';
import React, { useEffect, useState } from 'react';
import { appDispatcher, commentService, getUser } from '../init';
import { ICcData, ILanguage } from '../models/DataModel';
import { ApiResource } from '../utils/ApiResource';
import { AlertDialog } from './AlertDialog';
import { SimpleLoader } from './SimpleLoader';
import { StudentResultItem } from './StudentResults.Item';
import { StudentResultsDialogForTeacher } from './StudentResultsDialog';
import { useOpenClose } from '../utils/StateUtils';
import { RenderSolution } from '../utils/renderers';
import { Container } from '@material-ui/core';


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
    const [user, setUser] = React.useState(getUser());
    const [rng, setRng] = React.useState(Math.random());
    const [isOpen, openDialog, closeDialog] = useOpenClose(true);

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


    const refresh = () => {
        setRng(Math.random());
    }

    appDispatcher.register((payload: any) => {
        if (payload.actionType == "commentServiceChanged") {
            setItems([...commentService.items]);
        }
        if (payload.actionType == "userChanged") {
            setUser(getUser());
        }
    });



    if (!result || !user.role) {
        return <SimpleLoader />
    }

    if (user.role === "student") {
        return <Container>
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
        </Container>
    }

    if (user.role === "root") {
        return <Container>
            {isOpen && 
                <StudentResultsDialogForTeacher
                onClose={closeDialog}
                result={result}
                onRefresh={refresh}
                />
            }
            <Button variant="contained" color="primary" onClick={openDialog}>Open Grade Dialog</Button>
            <RenderSolution result={result}/>
        </Container>
    }
    return <span>unknown role</span>
}