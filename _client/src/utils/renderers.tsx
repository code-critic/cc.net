import React from "react";
import parse from 'html-react-parser';
import { observable } from "mobx";
import { observer } from "mobx-react";

import ReactMde from "react-mde";
import * as Showdown from "showdown";
import "react-mde/lib/styles/css/react-mde-all.css";
import { ICcData, ILineComment } from "../models/DataModel";
import { ListItem, ListItemText, ListItemIcon, Tooltip, Button, Tabs, Tab } from "@material-ui/core";
import Moment from "react-moment";
import { commentService, User, CommentServiceItem, appDispatcher } from "../init";


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

        const comment: CommentServiceItem = {
            result: result,
            comment: {
                line: lineNo,
                text: converter.makeHtml(this.editorValue),
                user: User.id,
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
        const { lineNo, liElement, result, filename } = this.props;
        const { editorOpen, selectedTab, editorValue, extraComments } = this;
        const allComments = [...extraComments, ...(result.comments || [])];

        const comments: ILineComment[] = allComments.filter(
            i => i.line.toString() === lineNo.toString()
                && i.filename === filename
        );

        const hasComments = comments.length > 0;
        const complexLayout = hasComments || editorOpen;

        let order = 0;
        return <tr key={lineNo}>
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

export const renderCode = (code: string, language: string) => {
    const html = window.PR.prettyPrintOne(code.replace(/</g, "&lt;"), language, true);
    const parsed = parse(html) as any;
    const children = (parsed.props.children || []) as React.ElementType<HTMLDataListElement>[];

    return <>
        <table className="source-code">
            <tbody>
                {children.map((liElement, lineNo) =>
                    <tr>
                        <td className="blob-num" data-line-number={lineNo + 1}></td>
                        <td className="blob-code" children={(liElement as any).props.children} />
                    </tr>
                )}
            </tbody>
        </table>
    </>;
}


interface RenderSolutionProps {
    result: ICcData;
}

@observer
export class RenderSolution extends React.Component<RenderSolutionProps, any, any> {

    @observable
    public tabIndex = 0;

    render() {
        const { result } = this.props;
        const solutions = [...result.solutions, { filename: "foo", content: "bar\nbar" }];

        return <div style={{ flexGrow: 1, display: "flex", minHeight: 480 }}>
            <Tabs
                value={this.tabIndex}
                onChange={(e, i) => this.tabIndex = i}
                orientation="vertical"
                variant="scrollable">
                {solutions.map((i, j) => <Tab key={j} label={i.filename}></Tab>)}
            </Tabs>

            {solutions.map((solution, j) => {
                const html = window.PR.prettyPrintOne(solution.content.replace(/</g, "&lt;"), result.language, true);
                const parsed = parse(html) as any;
                let children = (parsed.props.children || []) as React.ElementType<HTMLDataListElement>[];
                if (!Array.isArray(children)) {
                    children = [children];
                }

                return j == this.tabIndex &&
                    <table key={j} className="source-code">
                        <tbody>
                            {children.map((liElement, lineNo) =>
                                <CodeLine
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