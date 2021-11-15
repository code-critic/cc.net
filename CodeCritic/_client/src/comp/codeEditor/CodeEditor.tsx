import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/mdn-like.css';
// import 'codemirror/theme/mdn-like.css';
import 'codemirror/mode/python/python.js';
import 'codemirror/mode/javascript/javascript.js';
import 'codemirror/mode/clike/clike.js';
import 'codemirror/mode/octave/octave.js';

import React, { useEffect, useState } from 'react';
import { Controlled as CodeMirror } from 'react-codemirror2';

import { ICourseProblem, ISimpleFile } from '../../cc-api';
import { useDnD } from '../../hooks/useDnD';
import { ILanguage } from '../../models/CustomModel';
import { ProblemType } from '../../models/Enums';
import LanguageExamples from '../../utils/LanguageExamples';
import { isFiletypeSupported, mapByExtension } from '../../utils/LanguageMap';
import { notifications } from '../../utils/notifications';
import { CodeEditorFileBar } from './CodeEditor.FileBar';

export const determineRequiredFiles = (problem: ICourseProblem, language: ILanguage) => {
    let result: ISimpleFile[] = [];
    // add unit test lib name
    if(problem.type === ProblemType.Unittest) {
        const unittestSpec = problem.unittest.find(u => u.lang === language.id);

        if (unittestSpec?.libname) {
            result.push(toSimpleLanguageFile(unittestSpec.libname, language));
        }
    }

    // add all other files
    if (problem.files.length > 0) {
        result = [...result, ...problem.files.map(i => toSimpleLanguageFile(i, language))];
    }

    // add main file if result is empty
    if (result.length === 0) {
        result.push(toSimpleLanguageFile("main.{extension}", language));
    }

    return result;
}

const toSimpleLanguageFile = (filename: string, language: ILanguage) => {
    return toSimpleFile(filename.replaceAll("{extension}", language.extension))
}

const toSimpleFile = (filename: string) => {
    return {
        filename: filename,
        isDir: false,
        files: [],
        content: "",
        relPath: `${filename}`,
        rawPath: null,
    } as ISimpleFile
}
interface CodeEditorProps {
    problem: ICourseProblem;
    language: ILanguage;
    onChange(files: ISimpleFile[]): void;
}
export const CodeEditor = (props: CodeEditorProps) => {
    const { problem, language, onChange } = props;
    const requiredFiles = determineRequiredFiles(problem, language);

    const [ isFullScreen, setFullScreen ] = useState(false);
    const { isDragging } = useDnD(document, (fs) => onFileDrop(fs));

    const [ files, setFiles ] = useState<ISimpleFile[]>(requiredFiles);
    const [ selectedFile, setSelectedFile ] = useState(files[0]?.relPath);
    const selectedRef = files.find(i => i.relPath === selectedFile);

    useEffect(() => {
        const requiredFiles = determineRequiredFiles(problem, language);
        const newFiles = [...requiredFiles, ...files.filter(i => !!i.content)];
        updateFiles(newFiles);
        setSelectedFile(newFiles[0]?.relPath);
    }, [ language.id ]);


    const updateFiles = (newFiles: ISimpleFile[]) => {
        onChange(newFiles);
        setFiles([...newFiles]);
    }

    const onNewFile = (filename: string) => {
        if (files.some(i => i.relPath === filename)) {
            return `File ${filename} already exists!`;
        }
        updateFiles([...files, toSimpleFile(filename)]);
        setSelectedFile(filename);
        return true;
    }

    const onDeleteFile = (filename: string) => {
        if (requiredFiles.some(i => i.relPath === filename)) {
            return `The file ${filename} is required! and cannot be deleted`;
        }
        const newFiles = files.filter(i => i.relPath != filename);
        updateFiles([...newFiles]);
        setSelectedFile(newFiles[0]?.relPath);
        return true;
    }

    const onFullScreen = (on: boolean) => {
        setFullScreen(!isFullScreen);
    }

    const handleChange = (editor: any, data: any, value: string) => {
        if (selectedRef) {
            setContent(selectedFile, value);
        }
    }

    const setContent = (relPath: string, content: string) => {
        const idx = files.findIndex(i => i.relPath === relPath);
        if (idx >= 0) {
            files[idx].content = content;
        } else {
            const newFile = toSimpleFile(relPath);
            newFile.content = content;
            files.push(newFile);
        }
        updateFiles([...files]);
    }

    const onFileDrop = (droppedFiles: File[]) => {
        const dropped:string[] = [];

        function getContent(f: File): Promise<string> {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    resolve(reader.result as string);
                }
                reader.readAsText(f as any);
            })
        }

        droppedFiles.forEach(async (file) => {
            if (!isFiletypeSupported(file.name)) {
                notifications.error(`File ${file.name} is not supported at the moment`);
            } else {
                const content = await getContent(file);
                setContent(file.name, content);
                dropped.push(file.name);
            }
        });

        if (dropped.length > 0) {
            setSelectedFile(dropped[dropped.length - 1]);
        }
    }

    const getContentOrDefault = (filename: string, language: ILanguage, content: any) => {
        if (content) {
            return content as string;
        }
        
        if (problem.type === ProblemType.Unittest) {
            const unittestSpec = problem.unittest.find(u => u.lang === language.id && u.libname === filename);
            if (unittestSpec) {
                const func = LanguageExamples.templatesLibname[language.id];
                if (func) {
                    return func(unittestSpec);
                }
            }
        }

        const def: string | null = LanguageExamples.templatesMain[language.id];
        return def ? def.trim() : "";
    }

    return (<div className={`code-editor-wrapper pretty-scrollbar file-dropzone ${isDragging ? "active" : ""} ${isFullScreen ? "fullscreen" : ""}`}>
        <CodeEditorFileBar
            onChange={setSelectedFile}
            onDeleteFile={onDeleteFile}
            onNewFile={onNewFile}
            onFullScreen={onFullScreen}
            files={files}
            selected={selectedFile} />

        <CodeMirror
            options={{
                mode: mapByExtension(language.extension),
                theme: 'mdn-like',
                lineNumbers: true,
                dragDrop: false,
                fixedGutter: false,
                matchBrackets: true,
                // parserfile: ["./static/3rd/tokenizecsharp.js", "./static/3rd/parsecsharp.js"]
            }}
            value={getContentOrDefault(selectedFile, language, selectedRef?.content)}
            onBeforeChange={handleChange}
        />
    </div>)
}