import { Button, ButtonGroup, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, IconButton, TextField } from '@material-ui/core';
import * as React from 'react';
import { useState } from 'react';
import { ISimpleFile } from '../../models/DataModel';
import AddIcon from '@material-ui/icons/Add';
import { useOpenClose } from "../../hooks/useOpenClose";
import { onEnter } from '../../utils/onEnter';
import { supportedExtensions, isFiletypeSupported } from '../../utils/LanguageMap';
import { notifications } from '../../utils/notifications';
import CloseIcon from '@material-ui/icons/Close';
import FullscreenIcon from '@material-ui/icons/Fullscreen';

interface CodeEditorFileBarProps {
    files: ISimpleFile[];
    selected: string;

    onNewFile(filename: string): true | string;
    onDeleteFile(filename: string): true | string;
    onChange(file: string): void;
    onFullScreen(on: boolean): void;
}
export const CodeEditorFileBar = (props: CodeEditorFileBarProps) => {
    const { onNewFile, onChange, onDeleteFile, onFullScreen } = props;
    const { files, selected } = props;

    const [open, setOpen, setClose] = useOpenClose();
    const [filename, setFilename] = useState("");
    const isValidFile = filename.trim().length > 0
        && filename.includes(".")
        && isFiletypeSupported(filename)
        && !filename.includes("..");

    const addNewFile = () => {
        if(!isValidFile) {
            return;
        }

        const result = onNewFile(filename.trim());
        if (result === true) {
            setClose();
        } else {
            notifications.error(result);
        }
    }

    const deleteFile = (filename) => {
        const result = onDeleteFile(filename.trim());
        if (result === true) {
            setClose();
        } else {
            notifications.error(result);
        }       
    }

    const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, filename: string ) => {
        if (e.button === 1) {
            deleteFile(filename);
        } else {
            e.stopPropagation();
            e.preventDefault();
        }
    }

    return (<div className="filebar pretty-scrollbar">
        {files.map(i => <ButtonGroup key={i.relPath} size="small" className={`${selected === i.relPath ? "selected" : ""}`}>
            <Button onClick={() => onChange(i.relPath)} onMouseDown={e => handleMouseDown(e, i.relPath)}>
                {i.filename}
            </Button>
            <Button className="close-btn" onClick={() => deleteFile(i.relPath)}>
                <CloseIcon />
            </Button>
        </ButtonGroup>)}
        <Button className="new-file-btn" onClick={setOpen}>
            <AddIcon />
        </Button>
        <Button className="fullscreen-btn" onClick={() => onFullScreen(true)}>
            <FullscreenIcon />
        </Button>
        {open && <Dialog open={open} onClose={setClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                Add file to the solution
                </DialogTitle>
            <DialogContent>
                <TextField fullWidth autoFocus placeholder={`new filename.{${supportedExtensions.join(", ")}}`}
                    onKeyPress={onEnter(addNewFile)}
                    onChange={e => setFilename(e.target.value)} />
            </DialogContent>
            <DialogActions>
                <Button onClick={setClose} color="secondary">Cancel</Button>
                <Button onClick={addNewFile} color="primary" disabled={!isValidFile} >Create</Button>
            </DialogActions>
        </Dialog>}
    </div>)
}