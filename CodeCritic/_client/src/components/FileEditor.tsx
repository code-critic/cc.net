import React from 'react';

// import ReactAce from 'react-ace-editor';
import { mapByExtension } from '../utils/LanguageMap';
import { Controlled as CodeMirror } from 'react-codemirror2'

import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';

import 'codemirror/mode/python/python';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/octave/octave';
import 'codemirror/mode/clike/clike';

interface FileEditorProps {
    onChange(content: string): void;
    content: string;

    filename: string;
    language?: string;
}

export const FileEditor = (props: FileEditorProps) => {
    const { filename, content } = props;
    const { onChange } = props;

    const extension = filename.split(".").reverse()[0];

    return (
        <CodeMirror
            value={content}
            options={{
                mode: mapByExtension(extension),
                lineNumbers: true,
            }}
            onBeforeChange={(editor, data, value) => {
                onChange(value);
            }}
            onChange={(editor, data, value) => {

            }}
        />);
}