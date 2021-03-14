import React from "react";
import parse from 'html-react-parser';
import { observable } from "mobx";
import { observer } from "mobx-react";

import ReactMde from "react-mde";
import * as Showdown from "showdown";

import "react-mde/lib/styles/css/react-mde-all.css";
// import "prismjs/plugins/line-numbers/prism-line-numbers.css"
// import "prismjs/prism.js"
// import "prismjs/plugins/line-numbers/prism-line-numbers"
// import "prismjs/themes/prism.css"
// import "prismjs/components/prism-java"
// import "prismjs/components/prism-matlab"
// import "prismjs/components/prism-csharp"
// import "prismjs/components/prism-javascript"
// import "prismjs/components/prism-python"

import { ICcData, ILineComment, ICcDataSolution, ICommentServiceItem } from "../models/DataModel";
import { ListItem, ListItemText, ListItemIcon, Button, Tabs, Tab } from "@material-ui/core";
import Moment from "react-moment";
import { commentService, getUser } from "../init";
import { DynamicFolder } from "../components/DynamicFolder";
import FolderIcon from '@material-ui/icons/Folder';
import VisibilityIcon from '@material-ui/icons/Visibility';
import Tooltip from '@material-ui/core/Tooltip';
import { mapByExtensionPrism } from "./LanguageMap";


const converter = new Showdown.Converter({
    tables: true,
    simplifiedAutoLink: true,
    strikethrough: true,
    tasklists: true
});


declare global {
    interface PrettyCode {
        prettyPrintOne: (sourceCodeHtml: string, opt_langExtension: string, opt_numberLines: boolean) => string;
        prettyPrint: (opt_whenDone: Function, root: HTMLElement | HTMLDocument) => void;
    }

    interface Window {
        PR: PrettyCode;
    }
}

interface CodeLineProps {
    lineNo: number;
    liElement: React.ElementType<HTMLDataListElement>;
    filename: string;
    result: ICcData;
    hidden: boolean;
}

@observer
export class CodeLine extends React.Component<CodeLineProps, any, any> {

    @observable
    public editorOpen = false;

    @observable
    public editorValue: string = "";

    @observable
    public selectedTab: "write" | "preview" = "write";

    @observable
    public extraComments: ILineComment[] = [];

    makeComment() {
        const { lineNo, result, filename } = this.props;
        const comment: ICommentServiceItem = {
            objectId: result.objectId,
            comment: {
                line: lineNo,
                text: converter.makeHtml(this.editorValue),
                user: getUser().id,
                time: new Date().getTime() / 1000,
                filename: filename
            }
        };

        commentService.prepareComment(comment);
        this.extraComments.push(comment.comment);
        this.editorValue = "";
        this.editorOpen = false;

    }

    render() {
        const { lineNo, liElement, result, filename, hidden } = this.props;
        const { editorOpen, selectedTab, editorValue, extraComments } = this;
        const allComments = [...extraComments, ...(result.comments || [])];

        const comments: ILineComment[] = allComments.filter(
            i => i.line.toString() === lineNo.toString()
                && i.filename === filename
        );

        const hasComments = comments.length > 0;
        const complexLayout = hasComments || editorOpen;

        let order = 0;
        return <tr key={lineNo} data-component="CodeLine">
            <td className="blob-num" data-line-number={lineNo}
                onClick={() => this.editorOpen = !this.editorOpen}>
            </td>
            {complexLayout &&
                <td>
                    <div className="blob-code highlighted" children={(liElement as any).props.children}></div>
                    {hasComments && <div>
                        {comments.map(i => {
                            const date = Math.floor(i.time) * 1000;

                            return <ListItem key={date} alignItems="flex-start">
                                <ListItemIcon>
                                    <span className={`avatar-inicials ${order++ % 2 == 0 ? "odd" : "even"}`}>
                                        {i.user.split(".").map(i => i.charAt(0).toUpperCase()).join("")}
                                    </span>
                                </ListItemIcon>
                                <ListItemText primary={<>
                                    <span>{i.user}</span> &nbsp;
                                <Tooltip title={<Moment>{date}</Moment>}>
                                        <small>
                                            <Moment fromNow>{date}</Moment>
                                        </small>
                                    </Tooltip>
                                </>} secondary={<span dangerouslySetInnerHTML={{ __html: i.text }}></span>} />
                            </ListItem>
                        })}
                    </div>}

                    {editorOpen && <div>
                        <ReactMde
                            minEditorHeight={100}
                            maxEditorHeight={200}
                            value={editorValue}
                            selectedTab={selectedTab}
                            onChange={value => this.editorValue = value}
                            onTabChange={value => this.selectedTab = value}
                            generateMarkdownPreview={markdown => Promise.resolve(converter.makeHtml(markdown))}
                        />
                        <Button
                            className="my-2"
                            color="primary"
                            variant="outlined"
                            disabled={!editorValue}
                            onClick={() => this.makeComment()}
                        >Prepare Comment for submission</Button>
                    </div>}
                </td>
            }
            {!complexLayout &&
                <td className="blob-code" children={(liElement as any).props.children} />
            }

        </tr >
    }
}

export const renderCode = (code: string, language: string = "none") => {
    if (language === "none") {
        const children = code.trimEnd().split("\n");

        return <>
            <table className="source-code">
                <tbody>
                    {children.map((liElement, lineNo) =>
                        <tr key={lineNo}>
                            <td className="blob-num" data-line-number={lineNo + 1}></td>
                            <td className="blob-code">{liElement}</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </>;
    } else {
        const html = window.PR.prettyPrintOne(code.replace(/</g, "&lt;"), language, true);
        const parsed = parse(html) as any;
        const children = (parsed.props.children || []) as any[];

        return <>
            <table className="source-code">
                <tbody>
                    {children.map((liElement, lineNo) =>
                        <tr key={lineNo}>
                            <td className="blob-num" data-line-number={lineNo + 1}></td>
                            <td className="blob-code" children={(liElement as any).props.children} />
                        </tr>
                    )}
                </tbody>
            </table>
        </>;
    }

}


interface RenderSolutionProps {
    result: ICcData;
}

const InvisibleIcon = (hidden: boolean) => {
    if (hidden) {
        return <>
            <Tooltip title="Only visible to teachers">
                <>
                    <VisibilityIcon fontSize="small" color="secondary" className="tiny-icon" />
                    <span>&nbsp;</span>
                </>
            </Tooltip>
        </>
    }
    return <></>;
}

@observer
export class RenderSolution extends React.Component<RenderSolutionProps, any, any> {

    @observable
    public tabIndex = 1;

    render() {
        const { result } = this.props;
        const user = getUser();
        const solutions: ICcDataSolution[] = result.solutions
            .filter(i => !i.hidden || user?.role === "root");

        return <div style={{ flexGrow: 1, display: "flex", minHeight: 480 }} data-component="RenderSolution">
            <Tabs
                className="file-explorer"
                value={this.tabIndex}
                onChange={(e, i) => this.tabIndex = i}
                orientation="vertical"
                variant="scrollable">

                {solutions.map((i, j) => {
                    i.index = j;
                    if (i.isSeparator) {
                        return <Tab title={i.filename} key={j} className="tab-separator"></Tab>
                    }
                    if (i.isDynamic) {
                        return <Tab key={j} icon={<FolderIcon />} label={i.filename}></Tab>
                    }
                    return <Tab key={j} icon={InvisibleIcon(i.hidden)} label={i.filename}></Tab>
                })}
            </Tabs>

            {solutions
                .filter(i => !i.isSeparator)
                .map((solution, j) => {
                    if (solution.isDynamic) {
                        return solution.index == this.tabIndex &&
                            <DynamicFolder key={j} solution={solution} />
                    }

                    if (solution.filename?.toLowerCase().endsWith(".png")) {
                        return solution.index == this.tabIndex &&
                            <img key={j} src={`data:image/png;base64,${solution.content}`}
                                style={{ maxWidth: "calc(100% - 200px)", height: "auto" }} />
                    }

                    const extension = solution.filename.split(".").reverse()[0];
                    const syntax = mapByExtensionPrism(extension);
                    /*if(solution.content) {
                        return <pre key={j} className="line-numbers" data-start="1" onClick={(e) => {
                            const isLN = (e.target as any).className === "";
                            if(isLN) {
                                const ln = 1 + [...(e.target as any).parentElement.children].indexOf(e.target);
                            }
                        }}>
                            <PrismCode className={`language-${syntax}`}>{solution.content}</PrismCode>
                        </pre>
                    }*/
                    
                    const html = window.PR.prettyPrintOne(solution.content.replace(/</g, "&lt;"), syntax, true);
                    const parsed = parse(html) as any;
                    let children = (parsed.props.children || []) as React.ElementType<HTMLDataListElement>[];

                    if (!Array.isArray(children)) {
                        children = [children];
                    }

                    return solution.index == this.tabIndex &&
                        <table key={j} className="source-code">
                            <tbody>
                                {children.map((liElement, lineNo) =>
                                    <CodeLine
                                        hidden={solution.hidden}
                                        filename={solution.filename}
                                        key={lineNo}
                                        lineNo={lineNo + 1}
                                        liElement={liElement}
                                        result={result} />
                                )}
                            </tbody>
                        </table>
                })}
        </div>;
    }
}

export const Grow = (props: any) => {
    return <span className="grow" {...props}>&nbsp;</span>
}

export const Tiny = (props: any) => {
    return <div className="tiny" {...props} />
}