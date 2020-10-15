import React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@material-ui/core/Tabs';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import Tab from '@material-ui/core/Tab';
import { FileChooser, IFile } from "../components/FileChooser";
import { FileEditor } from './FileEditor';
import { MultiFileModel } from '../routes/SolutionSubmit.Form';
import { openCloseState } from '../utils/StateUtils';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import AddIcon from '@material-ui/icons/Add';
import { IconButton, Button } from '@material-ui/core';

interface MultiFileEditorProps {
    maxFiles?: number
    model?: MultiFileModel;
    files: IFile[];
    updateFile(index: number, content: string);
    counter?: number;
}



export const MultiFileEditor = (props: MultiFileEditorProps) => {
    const { maxFiles, files, updateFile, counter } = props;
    const [value, setValue] = React.useState(0);
    const [newFileDialog, setNewFileDialog] = React.useState(false);
    const [openDialog, closeDialog] = openCloseState(setNewFileDialog);

    const [newName, setNewName] = React.useState("");

    const handleChange = (event, newValue) => {
        if (newValue >= files.length) {
            openDialog();
        } else {
            setValue(newValue);
        }
    };

    const selectedFile = files[value];
    const handleContentChange = (newContent: string) => {
        updateFile(value, newContent);
    }

    const handleTabClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, index: number) => {
        // delete file
        if (event.button == 1) {
            setValue(0);
            updateFile(index, null as any);
        }
        console.log(event.button);

    }
    const addNewFile = () => {
        if(!files.find(i => i.path === newName)) {
            closeDialog();
            updateFile(files.length, newName);
        }
    }

    const handleTabsClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        console.log(event.button);
    }

    return (<>
        <Dialog open={newFileDialog} onClose={closeDialog}>
            <DialogTitle>Enter name of the new file</DialogTitle>
            <DialogContent>
                <Box display="flex" flexDirection="row">
                    <TextField label="Filename" id="standard-required" defaultValue=""
                        onChange={e => setNewName(e.target.value as string)} />
                    <IconButton color="primary" onClick={addNewFile}><AddIcon /></IconButton>
                </Box>
            </DialogContent>
        </Dialog>
        <AppBar position="static" color="primary" className="tab-file-editor" elevation={2}>
            <Tabs value={value} onChange={handleChange} onMouseDown={handleTabsClick}>
                {files.map((file, index) => <Tab key={file.path} label={file.name} onMouseDown={e => handleTabClick(e, index)} />)}
                <Tab label="* Add New File" className="font-italic opa5" />
            </Tabs>
        </AppBar>
        <FileEditor
            filename={selectedFile?.name}
            onChange={newContent => handleContentChange(newContent)}
            content={selectedFile?.content || ""}
        />
    </>
    )
}