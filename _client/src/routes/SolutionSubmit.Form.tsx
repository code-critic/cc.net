import React from "react";

import { ILanguage } from "../models/DataModel";
import { Grid, Button, InputLabel, Select, MenuItem, FormControl, ButtonGroup, Dialog, DialogTitle, DialogContent, Tooltip } from '@material-ui/core';


import HelpIcon from '@material-ui/icons/Help';

import LanguageExamples from '../utils/LanguageExamples';
import { mapLanguage } from '../utils/LanguageMap';
import { renderCode } from "../utils/renderers";
import ReactAce from 'react-ace-editor';


const Adapt = ({ children, ...other }) => children(other);
interface SolutionSubmitFormProps {
    selectedLanguage: string;
    languages: ILanguage[];
    currentLanguage: ILanguage | undefined;
    prefferedCode: string;

    onLanguageChange: (language: string) => void;
    onEditorChange: (state: any) => void;
    onEditorRef: (ref: any) => void;
}

export const SolutionSubmitForm = (props: SolutionSubmitFormProps) => {
    const { languages, selectedLanguage, currentLanguage, prefferedCode } = props;
    const { onEditorRef, onEditorChange, onLanguageChange } = props;

    const [exampleDialogOpen, setExampleDialogOpen] = React.useState(false);

    return <>
        <Grid item xs={12}>
            <FormControl variant="outlined" fullWidth style={{marginTop: 10}}>
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
                                    .map(i => <MenuItem key={i.id} value={i.id}>{i.name} ({i.version})</MenuItem>
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
                            <pre><code>
                                {}
                            </code></pre>
                        </DialogContent>
                    </Dialog>
                }
            </FormControl>
        </Grid>
        <Grid item xs={12}>
            <FormControl variant="outlined" fullWidth>
                <ReactAce
                    mode={mapLanguage(selectedLanguage)}
                    onChange={i => onEditorChange(i)}
                    ref={i => onEditorRef(i)}
                    id="source-code"
                    theme="eclipse"
                    setReadOnly={false}
                    setValue={prefferedCode}
                    style={{ height: "400px", width: "100%" }}
                />
            </FormControl>
        </Grid>
    </>
}