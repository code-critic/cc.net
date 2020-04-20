import React from "react";
import parse from 'html-react-parser';
import { observable } from "mobx";
import { observer } from "mobx-react";

import ReactMde from "react-mde";
import * as Showdown from "showdown";
import "react-mde/lib/styles/css/react-mde-all.css";
import { ICcData, ILineComment } from "../models/DataModel";
import { ListItem, ListItemText, ListItemAvatar, ListItemIcon, Tooltip, Button } from "@material-ui/core";
import Moment from "react-moment";
import { commentService, User, CommentServiceItem } from "../init";


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
        const { lineNo, result } = this.props;
        const comment: CommentServiceItem = {
            result: result,
            comment: {
                line: lineNo,
                text: converter.makeHtml(this.editorValue),
                user: User.id,
                time: new Date().getTime() / 1000
            }
        };

        commentService.prepareComment(comment);
        this.extraComments.push(comment.comment);
        this.editorValue = "";
        this.editorOpen = false;
        
    }
    render() {
        const { lineNo, liElement, result } = this.props;
        const { editorOpen, selectedTab, editorValue, extraComments } = this;
        const allComments = [...extraComments, ...(result.comments || [])];

        const comments: ILineComment[] = allComments.filter(
            i => i.line.toString() === lineNo.toString()
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
                                </>} secondary={<span dangerouslySetInnerHTML={{__html: i.text}}></span>} />
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
            {
                !complexLayout &&
                <td className="blob-code" children={(liElement as any).props.children} />
            }

        </tr >
    }
}

export const renderSolution = (result: ICcData) => {
    const { solution } = result;
    const html = window.PR.prettyPrintOne(solution.replace(/</g, "&lt;"), result.lang, true);
    const parsed = parse(html) as any;
    const children = (parsed.props.children || []) as React.ElementType<HTMLDataListElement>[];

    return <>
        <table className="source-code">
            <tbody>
                {children.map((liElement, lineNo) =>
                    <CodeLine
                        key={lineNo}
                        lineNo={lineNo + 1}
                        liElement={liElement}
                        result={result} />
                )}
            </tbody>
        </table>
    </>;
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