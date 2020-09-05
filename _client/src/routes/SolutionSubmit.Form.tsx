import React from "react";

import { ILanguage, ICourseProblem } from "../models/DataModel";
import { FileChooser, IFile } from "../components/FileChooser";
import { Grid, Button, InputLabel, Select, MenuItem, FormControl, ButtonGroup, Dialog, DialogTitle, DialogContent, Tooltip, IconButton, Typography, Box } from '@material-ui/core';


import HelpIcon from '@material-ui/icons/Help';

import LanguageExamples from '../utils/LanguageExamples';
import { mapLanguage } from '../utils/LanguageMap';
import { renderCode } from "../utils/renderers";
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';
import { FileEditor } from "../components/FileEditor";
import { MultiFileEditor } from "../components/MultiFileEditor";


const inputProps: any = {
    webkitdirectory: "",
    directory: "",
}

export class MultiFileModel {
    public files: IFile[] = [];
}

const Adapt = ({ children, ...other }) => children(other);
interface SolutionSubmitFormProps {
    selectedLanguage?: string;
    enabledLanguages?: ILanguage[];
    currentLanguage?: ILanguage | undefined;
    prefferedCode?: string;
    
    onEditorChange?: (state: any) => void;
    onEditorRef?: (ref: any) => void;
    
    onLanguageChange: (language: string) => void;
    onFileChange: (files: IFile[]) => void;
    languages: ILanguage[];
    activeProblem: ICourseProblem;
}

export const SolutionSubmitForm = (props: SolutionSubmitFormProps) => {
    const { languages, selectedLanguage, currentLanguage, prefferedCode, enabledLanguages, activeProblem } = props;
    const { onEditorRef, onEditorChange, onLanguageChange } = props;
    const { onFileChange } = props;

    const [exampleDialogOpen, setExampleDialogOpen] = React.useState(false);
    const [isFullScreen, setFullScreen] = React.useState(false);
    const extension = currentLanguage ? currentLanguage.extension : "py";
    const unittest = activeProblem.unittest === true;
    const libName = unittest ? activeProblem.libname : null;
    const defaultName = libName || `main.${extension}`;

    const [files, setFiles] = React.useState<IFile[]>([{
        name: defaultName,
        path: defaultName,
    }]);

    const checkFilesAndConfirm = (files) => {
        const reqIndex = files.map(i => i.path).indexOf(defaultName);
        if (reqIndex === -1) {
            setFiles([...files, { name: defaultName, path: defaultName, content: "" }]);
        } else {
            setFiles([...files]);
        }
        onFileChange(files);
    }

    const mergeFiles = (newFiles: IFile[]) => {
        let allFiles = [...files];

        newFiles.forEach((file, index) => {
            const findIndex = allFiles.map(i => i.path).indexOf(file.path);
            // existing file is overwritten
            if (findIndex !== -1) {
                allFiles[findIndex] = file;
            } else {
                allFiles.push(file);
            }
        })
        return allFiles;
    }

    const handleFileUpdate = (index, newContent) => {
        if (newContent === null) {
            checkFilesAndConfirm(files.filter((i, j) => j != index));
        } else {
            files[index].content = newContent;
            checkFilesAndConfirm(files);
        }
    }

    const handleFileDrop = (files: IFile[]) => {
        const mergedFiles = mergeFiles(files);

        checkFilesAndConfirm([...mergedFiles]);
        files.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = () => {
                const binaryStr = reader.result;
                files[index].content = binaryStr as string;
                checkFilesAndConfirm([...mergedFiles]);
            }
            reader.readAsText(file as any);
        });
    }

    return <>
        <Grid item xs={12}>
            {activeProblem.unittest !== true && <FormControl variant="outlined" fullWidth style={{ marginTop: 10 }}>
                <InputLabel id="select-Language-label">Select Language</InputLabel>
                <ButtonGroup fullWidth>
                    <Adapt>
                        {({ className }) => (
                            <Select fullWidth labelId="select-language-label"
                                className={`${className} small`}
                                id="select-language"
                                label="Select Language"
                                value={selectedLanguage}
                                onChange={e => onLanguageChange(e.target.value as string)}>
                                {languages
                                    .filter(i => !i.disabled)
                                    .map(i =>
                                        <MenuItem key={i.id} value={i.id}>
                                            {i.name} ({i.version})
                                        </MenuItem>
                                    )}
                            </Select>
                        )}
                    </Adapt>

                    {currentLanguage &&
                        <Tooltip title={`View Example in ${currentLanguage.name}`}>
                            <Button size="small" variant="outlined" style={{ width: 70 }}
                                onClick={() => setExampleDialogOpen(!exampleDialogOpen)}>
                                <HelpIcon />
                            </Button>
                        </Tooltip>
                    }
                </ButtonGroup>
                {(currentLanguage && exampleDialogOpen) &&
                    <Dialog maxWidth="md"
                        onClose={() => setExampleDialogOpen(false)}
                        open={exampleDialogOpen}
                        fullWidth>
                        <DialogTitle>{currentLanguage.name}</DialogTitle>
                        <DialogContent>
                            {renderCode(
                                LanguageExamples.examples[currentLanguage.id],
                                mapLanguage(currentLanguage.id)
                            )}
                        </DialogContent>
                    </Dialog>
                }
            </FormControl>}
        </Grid>
        {activeProblem.unittest === true && <Grid item xs={12}>
            <Typography variant="h5">
                Restrictions:
            </Typography>
            <Box display="flex" flexDirection="column" mx={3}>
                <span>Required language: <code>{activeProblem.reference.lang}</code></span>
                <span>Required File: <code>{activeProblem.libname}</code></span>
            </Box>
        </Grid>}
        <Grid item xs={12}>
            <FormControl variant="outlined" fullWidth
                className={`form-control-editor ${isFullScreen ? "fullscreen" : ""}`}>
                <MultiFileEditor
                    updateFile={handleFileUpdate}
                    files={files} />
                <IconButton className="btn-fullscreen" onClick={() => setFullScreen(!isFullScreen)}>
                    {isFullScreen && <FullscreenExitIcon />}
                    {!isFullScreen && <FullscreenIcon />}
                </IconButton>
            </FormControl>
        </Grid>
        <Grid item xs={12}>
            <FileChooser onFileDrop={handleFileDrop} />
        </Grid>
    </>
}