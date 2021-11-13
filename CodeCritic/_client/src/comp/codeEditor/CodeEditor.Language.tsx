import React from 'react';

import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, IconButton, InputLabel,
    MenuItem, Select, Tooltip,
} from '@material-ui/core';
import LiveHelpIcon from '@material-ui/icons/LiveHelp';

import { useOpenClose } from '../../hooks/useOpenClose';
import { ILanguage } from '../../models/CustomModel';
import { highlightLine } from '../../text/highlight';
import LanguageExamples from '../../utils/LanguageExamples';
import { CodeEditorIcon } from './CodeEditor.Icon';


interface CodeEditorLanguageProps {
    language: ILanguage;
    allowedLanguages: ILanguage[];
    onChange(languageId: string): void;
}

export const CodeEditorLanguage = (props: CodeEditorLanguageProps) => {
    const { language, allowedLanguages } = props;
    const { onChange } = props;
    const [open, setOpen, setClose] = useOpenClose();

    const handleChange = ({ target: { value } }) => {
        onChange(value as string);
    }

    return (<div className="language">
        <div className="language-select">
            <FormControl fullWidth size="small">
                <InputLabel>Language</InputLabel>
                <Select
                    value={language.id}
                    onChange={handleChange}>
                    {allowedLanguages.map(i => <MenuItem key={i.id} value={i.id}>
                        <CodeEditorIcon languageId={i.id} />
                        <strong>{i.name}</strong>&nbsp;<small>({i.version})</small>
                    </MenuItem>)}
                </Select>
            </FormControl>
        </div>
        <div className="language-help">
            <Tooltip title={`Click to display an example in ${language.name}`}>
                <IconButton size="small" onClick={setOpen}>
                    <LiveHelpIcon />
                </IconButton>
            </Tooltip>
        </div>
        {open && <Dialog open={open} onClose={setClose} fullWidth maxWidth="md">
            <DialogTitle>{language.name} example</DialogTitle>
            <DialogContent>
                <pre dangerouslySetInnerHTML={{ __html: highlightLine(LanguageExamples.examples[language.id], language) }}></pre>
            </DialogContent>
            <DialogActions>
                <Button onClick={setClose} color="secondary">Close</Button>
            </DialogActions>
        </Dialog>}
    </div>)
}