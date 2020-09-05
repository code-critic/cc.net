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

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const selectedFile = files[value];
    const handleContentChange = (newContent: string) => {
        updateFile(value, newContent);
    }

    const handleTabClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, index: number) => {
        // delete file
        if (event.button == 1 && index !== value) {
            setValue(0);
            updateFile(index, null as any);
        }
        console.log(event.button);
        
    }
    const handleTabsClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        console.log(event.button);
    }
    
    return (<>
        <AppBar position="static" color="primary" className="tab-file-editor" elevation={2}>
            <Tabs value={value} onChange={handleChange} onMouseDown={handleTabsClick}>
                {files.map((file, index) => <Tab key={file.path} label={file.name} onMouseDown={e => handleTabClick(e, index)} />)}
            </Tabs>
        </AppBar>
        <FileEditor
                filename={selectedFile.name}
                onChange={newContent => handleContentChange(newContent)}
                content={selectedFile.content || ""}
            />
        </>
    )
}