import * as Showdown from "showdown";

import { Button, Container, FormControlLabel, Switch, Typography } from '@material-ui/core';
import React, { useState } from 'react';

import ClearIcon from '@material-ui/icons/Clear';
import { ILineComment } from '../models/DataModel';
import Moment from "react-moment";
import ReactMde from "react-mde";
import { getInitials } from '../utils/utils';
import { highlightLine } from './highlight';
import { useUser } from '../hooks/useUser';

const converter = new Showdown.Converter({
    tables: true,
    simplifiedAutoLink: true,
    strikethrough: true,
    tasklists: true
});


interface SingleCommentProps {
    comment: ILineComment;
}
const SingleComment = (props: SingleCommentProps) => {
    const { comment } = props;
    const initials = getInitials(comment.user);
    const pending = comment.time <= 0 ? "pending" : 0;

    return <tr className={`comment-row ${pending}`}>
        <td colSpan={2}>
            <div className="comment-grid">

                <div className="ava avatar-wrapper">
                    <div className="avatar" >{initials}</div>
                </div>

                <div className="inf">
                    <Typography component="span">{comment.user}</Typography>
                    <Typography component="span" color="textSecondary">
                        <small>&nbsp;
                            {comment.time > 0 && (<Moment fromNow>{comment.time * 1000}</Moment>)}
                            {comment.time <= 0 && <span>pending</span>}
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

const Dcomments: ILineComment[] = [
    {
        "text": "<p>csacascas\ncas\ncas</p>",
        "time": 1616777760.062,
        "user": "jan.hybs",
        "line": 8,
        "filename": "main.py"
    },
    {
        "text": "<p>prosim????</p>",
        "time": 1616797760.062,
        "user": "pavel.exner",
        "line": 8,
        "filename": "main.py"
    },
    {
        "text": "<p>csacas\ncsa\ncsa\n<strong>cascas</strong>csa</p>",
        "time": 1616777766.428,
        "user": "jan.hybs",
        "line": 17,
        "filename": "main.py"
    },
    {
        "text": "<p>acsas <em>cascas</em></p>",
        "time": 1616777774.662,
        "user": "jan.hybs",
        "line": 23,
        "filename": "main.py"
    }
];
const code = `import sys, time, re
from threading import Semaphore, Thread
from optparse import OptionParser
from typing import TextIO
 
parser = OptionParser()
parser.add_option("-p", "--program-size", dest="size", help="program size", default=None)
parser.add_option("-r", dest="rand", action="store_true", help="Use non-deterministic algo")
parser.add_option("-v", "--validate", action="store_true", dest="validate", help="program size", default=None)
parser.add_option("-i", "--inputfile", help="input file", default=None)
parser.add_option("-o", "--outputfile", help="input file", default=None)
 
 
class Tester:
    def __init__(self) -> None:
        self._value = 0
        self._tests = 0
        self._failed = 0
    
    def test(self, a, b, message):
        expression = a == b
        self._tests += 1
        whole_msg = f"{message}: {a} != {b}"
 
        if not expression:
            self._value = 1
            self._failed += 1
            print(whole_msg, file=sys.stderr)
        
        return expression
    
    def require(self, a, b, message):
        expression = self.test(a, b, message)
 
        if not expression:
            self.exit()
    
    def exit(self):
        if self._tests > 0:
            if self._value == 0:
                print(f"[PASSED] {(self._tests - self._failed)} / {self._tests}")
            else:
                print(f"[FAILED] {(self._tests - self._failed)} / {self._tests}")
        sys.exit(self._value)
 
 
tester = Tester()
 
def validate():
    
    with open(options.inputfile, "r") as fp:
        ours_solve = re.sub(r"\d", "?", solve(fp))
    
    with open(options.outputfile, "r") as fp:
        theirs_solve = re.sub(r"\d", "?",fp.read())
 
    theirs_file_lines = [l.strip() for l in theirs_solve.splitlines() if l.strip()]
    ours_solve_lines =  [l.strip() for l in ours_solve.splitlines() if l.strip()]
 
    tester.require(
        a = len(ours_solve_lines), 
        b = len(theirs_file_lines),
        message = f"Chybná délka výstupu"
    )
 
    for i in range(len(ours_solve_lines)):
        tester.test(
            a = ours_solve_lines[i],
            b = theirs_file_lines[i],
            message = f"Řádek {i+1:2d} se neshoduje"
        )
 
 
def solve(stdin: TextIO = sys.stdin):
    stdout = []
    class MT(Thread):
        def __init__(self, semaphore: Semaphore, index: int):
            super().__init__()
            self.semaphore = semaphore
            self.index = index
        
        def run(self):
            name = f"Thread-{self.index:02d}"
            acquired = self.semaphore.acquire(timeout=0.1)
 
            if not acquired:
                stdout.append(f"{name} is waiting...")
                self.semaphore.acquire()
 
            stdout.append(f"Hello from {name}!")
            time.sleep(0.3)
 
            self.semaphore.release()
        
        
    for line in stdin:
        N, M = map(int, line.strip().lower().split())
 
        semaphore = Semaphore(M)
        threads = [MT(semaphore, i+1) for i in range(N)]
 
        [t.start() for t in threads]
        [t.join() for t in threads]
    
    return '\n'.join(stdout)
 
 
options, args = parser.parse_args()
if options.validate:
    validate()
    tester.exit()
 
if options.size or options.rand:
    raise NotImplementedError("nic se negeneruje")
 
print(solve())
tester.exit()
    `;

interface ISourceCodeReview {
    filename: string,
    code: string;
}
export const SourceCodeReview = (props: ISourceCodeReview) => {
    const { filename, code } = props;

    const { user, isRoot, isStudent, canBeRoot, canBeStudent } = useUser();
    const [commentsOn, setCommentOn] = useState(true);
    const [editor, setEditor] = useState(-1);
    const [comments, setComments] = useState(Dcomments);

    const handleEditorClick = (ln) => {
        setEditor(editor == ln ? -1 : ln);
    }

    const addComment = (value: string, ln: number) => {
        const comment: ILineComment = {
            user: user.id,
            time: -1,
            line: ln,
            text: converter.makeHtml(value), // TODO: not like this
            filename: filename
        }
        setComments([...comments, comment]);
        setEditor(-1);
    }
    const toRow = (code: string, ln: number, isOpen: boolean, hasComments: boolean) => {
        const cls = isOpen ? "has-editor" : "";
        const cls2 = hasComments ? "has-comments" : "";

        return <tr key={ln + 1} className={`${cls} ${cls2}`}>
            <td className="line-number">
                <Button size="small" className="line-number-btn" onClick={() => handleEditorClick(ln)}>
                    {isOpen && <ClearIcon />}
                    {!isOpen && (ln + 1)}
                </Button>
            </td>
            <td><pre dangerouslySetInnerHTML={{ __html: code }} /></td>
        </tr>
    }

    const lines = code.split("\n");

    return <div>
        <Container maxWidth="lg">
            <FormControlLabel
                control={
                    <Switch
                        checked={commentsOn}
                        onChange={() => setCommentOn(!commentsOn)}
                        name="showComments"
                        color="primary"
                    />
                }
                label="Show comments"
            />
            <table className="code-editor-table">
                <tbody>
                    {lines.map((i, j) => {
                        const hasEditor = editor == j;
                        const hasComments = comments.filter(c => c.line == j).length > 0;

                        return <>
                            {toRow(highlightLine(i, "py"), j, commentsOn && hasEditor, commentsOn && hasComments)}
                            {commentsOn && comments.filter(c => c.line == j).map(c => <SingleComment comment={c} />)}
                            {commentsOn && hasEditor && <LineEditor onSave={(value) => addComment(value, j)} />}
                        </>
                    })}
                </tbody>
            </table>
        </Container>
    </div>
}