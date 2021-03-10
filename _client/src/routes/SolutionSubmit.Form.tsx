import React, { useEffect } from "react";

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
    languages: ILanguage[];
    defaultLanguage: ILanguage;
    onLanguageChange: (language: ILanguage) => void;
    onFileChange: (files: IFile[]) => void;
    activeProblem: ICourseProblem;
}

export const SolutionSubmitForm = (props: SolutionSubmitFormProps) => {
    const { languages, defaultLanguage, activeProblem } = props;
    const { onLanguageChange } = props;
    const { onFileChange } = props;

    const [exampleDialogOpen, setExampleDialogOpen] = React.useState(false);
    const [isFullScreen, setFullScreen] = React.useState(false);
    const [language, setLanguage] = React.useState(defaultLanguage);

    useEffect(() => {
        if(language.extension) {
            updateFiles(files);
        }
    }, [language?.extension]);

    const extension = language ? language.extension : "py";
    const requiredFiles = (activeProblem.files == null || !activeProblem.files.length ? ['main.{extension}'] : activeProblem.files )
        .map(i => i.replace("{extension}", extension));
    

    const toIFile = (name: string) => {
        return { name, path: name, content: "" } as IFile;
    }

    const getDefaultFiles = () => {
        return requiredFiles.map(toIFile);
    }

    const updateFiles = (newFiles: IFile[]) => {
        let result = (newFiles ?? []);
        result = result
            .filter(i => !!i.content || requiredFiles.includes(i.path));
        requiredFiles.forEach(path => {
            if (result.findIndex(i => i.path == path) === -1) {
                result.push(toIFile(path));
            }
        });
        setFiles([...result]);
    }

    const [files, setFiles] = React.useState<IFile[]>(getDefaultFiles());

    const handleLanguage = (id: string) => {
        const newLang = languages.find(i => i.id === id);
        if (newLang) {
            setLanguage(newLang)
            onLanguageChange(newLang);
        }
    }

    const checkFilesAndConfirm = (files) => {
        setFiles([...files]);
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

    const handleFileUpdate = (index: number, newContent: string) => {
        if (index >= files.length) {
            const newName = newContent;
            setFiles([...files, { name: newName, path: newName, content: "" }]);
        } else {

            // deleting file
            if (newContent === null) {
                checkFilesAndConfirm(files.filter((i, j) => j != index || requiredFiles.includes(i.path)));
            } else {
                files[index].content = newContent;
                checkFilesAndConfirm(files);
            }
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
                                value={language.id}
                                onChange={e => handleLanguage(e.target.value as string)}>
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

                    {language &&
                        <Tooltip title={`View Example in ${language.name}`}>
                            <Button size="small" variant="outlined" style={{ width: 70 }}
                                onClick={() => setExampleDialogOpen(!exampleDialogOpen)}>
                                <HelpIcon />
                            </Button>
                        </Tooltip>
                    }
                </ButtonGroup>
                {(language && exampleDialogOpen) &&
                    <Dialog maxWidth="md"
                        onClose={() => setExampleDialogOpen(false)}
                        open={exampleDialogOpen}
                        fullWidth>
                        <DialogTitle>{language.name}</DialogTitle>
                        <DialogContent>
                            {renderCode(
                                LanguageExamples.examples[language.id],
                                mapLanguage(language.id)
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
                <span>Required File(s): <code>{activeProblem.files.join(", ")}</code></span>
            </Box>
        </Grid>}
        <Grid item xs={12} className="my-3">
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