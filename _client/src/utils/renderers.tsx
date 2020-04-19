import React from "react";


declare global {
    interface PrettyCode {
        prettyPrintOne: (sourceCodeHtml: string, opt_langExtension: string, opt_numberLines: boolean) => string;
        prettyPrint: (opt_whenDone: Function, root: HTMLElement | HTMLDocument) => void;
    }

    interface Window {
        PR: PrettyCode;
    }
}

export const renderCode = (code: string, language: string, lineNumbers: boolean = false) => {
    const html = window.PR.prettyPrintOne(code.replace(/</g, "&lt;"), language, true);
    return <>
        <div>
            <div className="line-actions" > </div>
            < pre className={`prettyprint  no-hover-effect ${lineNumbers ? "" : "no-line-numbers"}`
            } dangerouslySetInnerHTML={{ __html: html }} />
        </div>
    </>;
}