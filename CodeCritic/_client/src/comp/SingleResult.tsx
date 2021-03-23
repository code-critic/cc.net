import { Container, Button, ButtonGroup } from '@material-ui/core';
import DeleteForeverOutlinedIcon from '@material-ui/icons/DeleteForeverOutlined';
import * as H from 'history';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { API } from '../api';
import { appDispatcher, commentService, getUser } from '../init';
import { ICcData, ILanguage } from '../models/DataModel';
import { RenderSolution } from '../utils/renderers';
import { useOpenClose } from '../utils/StateUtils';
import { AlertDialog } from '../components/AlertDialog';
import { SimpleLoader } from '../components/SimpleLoader';
import { StudentResultItem } from '../components/StudentResults.Item';
import { StudentResultsDialogForTeacher } from '../components/StudentResultsDialog';
import { useUser } from '../hooks/useUser';


interface SingleResultProps {
    objectId?: string;
}

export const SingleResult = (props: SingleResultProps) => {
    const params = useParams<any>();
    const objectId = props.objectId || params.objectId;

    const [result, setResult] = useState<ICcData | false>();
    const [languages, setLanguages] = React.useState<ILanguage[]>([]);
    const [items, setItems] = React.useState(commentService.items);
    const [discardDialog, setDiscardDialog] = React.useState(false);
    const [rng, setRng] = React.useState(Math.random());
    const [isOpen, openDialog, closeDialog] = useOpenClose(true);
    const [ft, setFt] = useState(true);
    const { user, isRoot, isStudent, canBeRoot, canBeStudent } = useUser();

    const refresh = () => {
        setRng(Math.random());
    }

    useEffect(() => {
        (async () => {
            try {
                const axiosResponseD = await API.get<ICcData>(`result/${objectId}`);
                setResult(axiosResponseD.data);
            } catch (error) {
                setResult(false);
            }

            if (!languages.length) {
                const axiosResponseL = await API.get<ILanguage[]>(`languages`);
                setLanguages(axiosResponseL.data);
            }
        })();
    }, [rng]);

    useEffect(() => {
        console.log(objectId);
        
        if (!ft) {
            refresh();
        }
        setFt(false);
    }, [objectId]);



    appDispatcher.register((payload: any) => {
        if (payload.actionType == "commentServiceChanged") {
            setItems([...commentService.items]);
        }
    });

    if (result === false) {
        return <div>Result does not exists or you do not have permission to view it.</div>
    }

    if (!result || !user.role) {
        return <SimpleLoader />
    }

    if (canBeStudent) {
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

    if (isRoot) {
        return <Container>
            {isOpen &&
                <StudentResultsDialogForTeacher
                    onClose={closeDialog}
                    result={result}
                    onRefresh={refresh}
                />
            }
            <Button variant="contained" color="primary" onClick={openDialog}>Open Grade Dialog</Button>
            <RenderSolution result={result} />
        </Container>
    }

    return <span>unknown roles: {user.roles.join()}</span>
}
