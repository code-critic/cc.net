import { IconButton } from '@material-ui/core';
import { AppBar, Box, Dialog, DialogContent, DialogTitle, Tab, Tabs, TextField} from '@material-ui/core';

import AddIcon from '@material-ui/icons/Add';
import React from 'react';
import { IFile } from "../components/FileChooser";
import { MultiFileModel } from '../routes/SolutionSubmit.Form';
import { openCloseState } from '../utils/StateUtils';
import { FileEditor } from './FileEditor';

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

    }
    const addNewFile = () => {
        if (!files.find(i => i.path === newName)) {
            closeDialog();
            updateFile(files.length, newName);
        }
    }

    const handleTabsClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
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