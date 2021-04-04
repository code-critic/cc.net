import React, { useEffect, useState } from 'react';
import { ILanguage } from '../models/DataModel';

const hljs = (window as any).hljs;


const getSyntax = (language: ILanguage | string) => {
    const ext = typeof(language) === "string" ? language : language.extension;

    switch(ext) {
        case "py":
            return "python";
        case "js":
            return "javascript";
        case "cs":
            return "csharp";
        case "java":
            return "java";
        case "m":
            return "matlab";
        case "cs":
            return "csharp";
        case "c":
            return "c";
        case "cpp":
            return "cpp";
        case "md":
            return "markdown";
        case "xml":
            return "xml";
        case "sh":
            return "bash";
        case "json":
            return "json";
        case "m":
            return "matlab";
    }
    return "plaintext";
}

export const highlight = (code: string, language: ILanguage | string) => {
    const lines = code.split("\n");
    const syntax = getSyntax(language);
    const transform = (s: string) => hljs.highlight(s, {language: syntax}).value;

    const chunks = lines
        .map(transform);

    return chunks as string[];
}

export const highlightLine = (line: string, language: ILanguage | string) => {
    const syntax = getSyntax(language);
    return hljs.highlight(line, {language: syntax}).value;
}