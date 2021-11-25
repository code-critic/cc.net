import React, { useEffect, useState } from 'react';
import ReactMde from 'react-mde';
import Moment from 'react-moment';

import { Button, Container, IconButton, Typography } from '@material-ui/core';
import ClearIcon from '@material-ui/icons/Clear';
import MoreVertIcon from '@material-ui/icons/MoreVert';

import { CodeCritic } from '../api';
import { ICommentServiceItem, ILineComment } from '../cc-api';
import { DropDownMenu } from '../components/DropDownMenu';
import { useComments } from '../hooks/useComments';
import { useTextSelection } from '../hooks/useTextSelection';
import { useUser } from '../hooks/useUser';
import { OptionType } from '../models/CustomModel';
import { converter } from '../renderers/markdown';
import { notifications } from '../utils/notifications';
import { getInitials, normalizePath } from '../utils/utils';
import { getSyntax, highlightLine, highlightPlainText } from './highlight';
import sanitizeHtml from 'escape-html';

interface SingleCommentProps {
    comment: ILineComment;
    onDelete(): void;
}
const SingleComment = (props: SingleCommentProps) => {
    const { comment, onDelete } = props;
    const initials = getInitials(comment.user);
    const isPending = comment.time <= 0;
    const pendingCls = isPending ? "pending" : "";

    return <tr className={`comment-row ${pendingCls}`}>
        <td colSpan={2}>
            <div className="comment-grid">

                <div className="ava avatar-wrapper">
                    <div className="avatar" >{initials}</div>
                </div>

                {isPending && <div className="cls">
                    <IconButton size="small" className="remove-comment" onClick={onDelete}>
                        <ClearIcon />
                    </IconButton>
                </div>}

                <div className="inf">
                    <Typography component="span">{comment.user}</Typography>
                    <Typography component="span" color="textSecondary">
                        <small>&nbsp;
                            {!isPending && (<Moment fromNow>{comment.time * 1000}</Moment>)}
                            {isPending && <span>pending</span>}
                        </small>
                    </Typography>
                </div>

                <div className="txt" dangerouslySetInnerHTML={{ __html: comment.text }} />
            </div>
        </td>
    </tr>
}

interface LineEditorProps {
    onSave(value): void;
}
const LineEditor = (props: LineEditorProps) => {
    const { onSave } = props;
    const [selectedTab, setSelectedTab] = useState<"write" | "preview">("write");
    const [value, setValue] = useState("");

    return <tr>
        <td colSpan={2}>
            <ReactMde
                minEditorHeight={100}
                maxEditorHeight={200}
                value={value}
                selectedTab={selectedTab}
                onChange={setValue}
                onTabChange={setSelectedTab}
                generateMarkdownPreview={markdown => Promise.resolve(converter.makeHtml(markdown))}
            />
            <Button
                className="my-2"
                color="primary"
                variant="outlined"
                disabled={!value}
                onClick={(e) => onSave(value)}
            >Prepare Comment for submission</Button>
        </td>
    </tr>
}


const binaryContentResult = (filename: string, data: string) => {
    const parts = filename.toLowerCase().split(".");
    const extension = parts[parts.length - 1];

    switch (extension) {
        case "png":
            return <img src={`data:image/png;base64,${data}`} />;
        case "jpg":
        case "jpeg":
            return <img src={`data:image/jpg;base64,${data}`} />;
        case "gif":
            return <img src={`data:image/gif;base64,${data}`} />;
        case "md":
            return <div dangerouslySetInnerHTML={{ __html: converter.makeHtml(data) }} />
    }
    return null;
}


interface ISourceCodeReview {
    objectId: string,
    relPath: string,
    code: string;
    comments: ILineComment[];
}
export const SourceCodeReview = (props: ISourceCodeReview) => {
    const { relPath, code, comments: defaultComment, objectId } = props;

    const { user, isRoot } = useUser();
    const [commentsOn, setCommentOn] = useState(true);
    const [editor, setEditor] = useState(-1);
    const { serviceItems, prepareComment, cancelComment } = useComments();
    const selectedText = useTextSelection();

    const comments = [
        ...defaultComment,
        ...serviceItems
            .filter(i => i.objectId == objectId)
            .map(i => i.comment)
    ].filter(i => normalizePath(i.filename) === normalizePath(relPath));

    const parts = relPath.toLowerCase().split(".");
    const extension = parts[parts.length - 1];

    if (typeof (code) !== "string") {
        return code;
    }

    const otherContent = binaryContentResult(relPath, code)
    if (otherContent !== null) {
        return otherContent;
    }

    const handleEditorClick = (ln) => {
        setEditor(editor == ln ? -1 : ln);
    }

    const addComment = (value: string, ln: number) => {
        const comment: ILineComment = {
            user: user.id,
            time: -1,
            line: ln,
            text: value,
            filename: relPath
        }
        const newComment = {
            comment: comment,
            objectId: objectId,
        } as ICommentServiceItem;

        // setExtraComments([...extraComment, newComment]);
        prepareComment(newComment);
        setEditor(-1);
    }

    const rerunSolution = async () => {
        try {
            await CodeCritic.api.rerunSolutionDetail(objectId);
            notifications.success("Ok, job will be executed again");
        } catch (e) {
            notifications.error(`Error while requesting rerun: ${e}`);
        }
    }

    const menuItems: OptionType[] = [
        { name: "Show comments", value: () => setCommentOn(true) },
        { name: "Hide comments", value: () => setCommentOn(false) },
        ...(isRoot ? [{ name: "Rerun solution", value: rerunSolution }] : [])
    ];

    const toRow = (code: string, ln: number, isOpen: boolean, hasComments: boolean, extraCls: string="") => {
        const cls = isOpen ? "has-editor" : "";
        const cls2 = hasComments ? "has-comments" : "";

        return <tr key={`row-${ln}`} className={`${cls} ${cls2}`}>
            <td className="line-number">
                <Button size="small" className="line-number-btn" onClick={() => handleEditorClick(ln)}>
                    {isOpen && <ClearIcon />}
                    {!isOpen && (ln + 1)}
                </Button>
            </td>
            <td className={`selectable ${extraCls}`}><pre dangerouslySetInnerHTML={{ __html: code }} /></td>
        </tr>
    }

    const deleteComment = (comment: ILineComment) => {
        cancelComment({ objectId: objectId, comment });
    }

    // TODO: remove at the beginingn of the next semester
    const lines = [...code.split("\n"), ""];
    let id = 0;
    return <div>
        <Container maxWidth="lg" style={{ position: "relative" }}>
            <div style={{ textAlign: "right", position: "absolute", top: 0, right: 0 }}>
                <DropDownMenu
                    onChange={i => i && i.value ? i.value() : void 0}
                    getLabel={i => i.name}
                    options={menuItems}
                    title={<MoreVertIcon />}
                />
            </div>
            <table className="code-editor-table">
                <tbody>
                    {lines.map((i, j) => {
                        const hasEditor = editor == j;
                        const hasComments = comments.filter(c => c.line == j).length > 0;
                        const commentsTrs = commentsOn
                            ? comments.filter(c => c.line == j).map((c, k) =>
                                <SingleComment key={id++} onDelete={() => deleteComment(c)} comment={c} />)
                            : [];

                        const editorTr = commentsOn && hasEditor
                            ? [<LineEditor key={`edit-${j}`} onSave={(value) => addComment(value, j)} />]
                            : [];

                        const syntax = getSyntax(extension);
                        const safeText = sanitizeHtml(i);
                        const highlightedText = syntax === "plaintext"
                            ? highlightPlainText(safeText)
                            : highlightLine(i, extension);
                        
                        let extraCls = "";
                        if (selectedText) {
                            const textRegex = new RegExp(`(^|[^a-z0-9_])${selectedText}($|[^a-z0-9_])`);
                            
                           if (i.match(textRegex)) {
                               extraCls = "has-selection";
                           }
                        }

                        const trs = [
                            toRow(highlightedText, j, commentsOn && hasEditor, commentsOn && hasComments, extraCls),
                            ...commentsTrs,
                            ...editorTr
                        ];

                        return trs;
                    })}
                </tbody>
            </table>
        </Container>
    </div>
}