import moment from 'moment';
import * as React from 'react';

import { Button } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import DescriptionIcon from '@mui/icons-material/Description';
import VerticalSplitIcon from '@mui/icons-material/VerticalSplit';
import GroupIcon from '@mui/icons-material/Group';
import ImageIcon from '@mui/icons-material/Image';
import LanguageIcon from '@mui/icons-material/Language';
import QueuePlayNextIcon from '@mui/icons-material/QueuePlayNext';
import TimelapseIcon from '@mui/icons-material/Timelapse';
import ViewListIcon from '@mui/icons-material/ViewList';
import { Alert, AlertTitle } from '@mui/material';

import { ICourseProblem } from '../../cc-api';
import { ILanguage } from '../../models/CustomModel';
import { ProblemStatus, ProblemType } from '../../models/Enums';
import { LightTooltip } from '../../renderers/LightTooltip';
import { languages } from '../../static/languages';
import { determineRequiredFiles } from '../codeEditor/CodeEditor';
import { useState } from 'react';

interface SubmitSolutionGroupTagProps {
    problem: ICourseProblem;
}

export const SubmitSolutionGroupTag = (props: SubmitSolutionGroupTagProps) => {
    const { problem } = props;
    const { minSize, maxSize } = problem.collaboration

    const title = <Alert severity="info" icon={<GroupIcon />}>
        <AlertTitle>For this problem, you can work in a group.</AlertTitle>
        {(minSize != maxSize) &&
            <p style={{ padding: 0, margin: 0 }}>
                Group must have at least <strong>{minSize}</strong>
            &nbsp;and at most <strong>{maxSize}</strong> students.
        </p>
        }
        {(minSize == maxSize) &&
            <p style={{ padding: 0, margin: 0 }}>
                Group must have exactly <strong>{maxSize}</strong> students
        </p>
        }
    </Alert>

    return (<LightTooltip title={title} enterTouchDelay={0} leaveTouchDelay={10000}>
        <div className="problem-tag info"><GroupIcon />{minSize} - {maxSize}</div>
    </LightTooltip>)
}


interface Dt {
    rel: string;
    abs: string;
}

const dt = (date: Date | string) => {
    const m = moment(date)
    return { rel: m.fromNow(), abs: m.format("llll") } as Dt;
}

interface SubmitSolutionDeadlineTagProps {
    problem: ICourseProblem;
}

export const SubmitSolutionDeadlineTag = (props: SubmitSolutionDeadlineTagProps) => {
    const { problem } = props;
    let msg: Dt;
    let desc: JSX.Element = <></>;
    let cls: 'success' | 'info' | 'warning' | 'error' = "info";

    switch (problem.statusCode) {
        case ProblemStatus.BeforeStart:
            msg = dt(problem.since);
            desc = <><AlertTitle>Submission not yet active</AlertTitle>
                it will open {msg.rel} ({msg.abs})
            </>;
            cls = "warning";
            break;
        case ProblemStatus.Active:
            msg = dt(problem.avail);
            desc = <><AlertTitle>Submission is now active</AlertTitle>
                it will close {msg.rel} ({msg.abs})
            </>;
            cls = "success";
            break;
        case ProblemStatus.ActiveLate:
            msg = { rel: "closing", abs: "" };
            desc = <><AlertTitle>It's after the deadline</AlertTitle>
                you can still submit your solution but you may not recieve full marks
            </>;
            cls = "warning";
            break;
        case ProblemStatus.AfterDeadline:
            msg = { rel: "closed", abs: "" };
            desc = <><AlertTitle>Submission closed</AlertTitle>
                You cannot submit solution anymore
            </>;
            cls = "error";
            break;
    }


    const title = <Alert severity={cls} icon={<AccessTimeIcon />}>
        {desc}
    </Alert>

    return (<LightTooltip title={title} enterTouchDelay={0} leaveTouchDelay={10000}>
        <div className={`problem-tag ${cls}`}><AccessTimeIcon />{msg.rel}</div>
    </LightTooltip>)
}

interface SubmitSolutionRequiredFilesTagProps {
    problem: ICourseProblem;
    language: ILanguage;
}

export const SubmitSolutionRequiredFilesTag = (props: SubmitSolutionRequiredFilesTagProps) => {
    const { problem, language } = props;
    const files = determineRequiredFiles(problem, language);

    const title = <Alert severity="info" icon={<DescriptionIcon />}>
        <AlertTitle>Following files are required</AlertTitle>
        <div>{files.map((i, j) => <div key={j}><code>{i.filename}</code></div>)}</div>
        <div><em><small>affected by selected language</small></em></div>
    </Alert>

    return (<LightTooltip title={title} enterTouchDelay={0} leaveTouchDelay={10000}>
        <div className="problem-tag info"><DescriptionIcon />{files.length}</div>
    </LightTooltip>)
}

interface SubmitSolutionRequiredLanguageTagProps {
    problem: ICourseProblem;
}

export const SubmitSolutionRequiredLanguageTag = (props: SubmitSolutionRequiredLanguageTagProps) => {
    const { problem } = props;
    const isUnittest = problem.type === ProblemType.Unittest;
    const cls = isUnittest ? "info" : "success";
    const language = isUnittest
        ? languages.find(i => i.id === problem.reference.lang)
        : null;

    const title = isUnittest
        ? (<Alert severity="info" icon={<LanguageIcon />}>
            <AlertTitle>{language.name} only!</AlertTitle>
            Solution must use programming language {language.name} ({language.version})
        </Alert>)
        : (<Alert severity="info" icon={<LanguageIcon />}>
            <AlertTitle>Any programming language!</AlertTitle>
            Solution can use any programming language
        </Alert>)

    return (<LightTooltip title={title} enterTouchDelay={0} leaveTouchDelay={10000}>
        <div className={`problem-tag ${cls}`}><LanguageIcon />{isUnittest && <>
            *.{language.extension}
        </>}</div>
    </LightTooltip>)
}


interface SubmitSolutionAssetsTagProps {
    problem: ICourseProblem;
}

export const SubmitSolutionAssetsTag = (props: SubmitSolutionAssetsTagProps) => {
    const { problem } = props;
    const { assets } = problem;
    const urlPrefix = `/static-files/serve/${problem.course}/${problem.year}/${problem.id}`;

    const GetExtraClass = (filename: string) => {
        const ext = filename.toLowerCase().split(".").reverse()[0];
        switch (ext) {
            case "xls":
            case "mat":
                return "MuiButton-outlinedPrimary green"
            case "jpg":
            case "jpeg":
            case "png":
            case "gif":
                return ""
            case "wav":
                return "MuiButton-outlinedPrimary"
        }
        return "";
    }
    const GetIcon = (filename: string) => {
        const ext = filename.toLowerCase().split(".").reverse()[0];
        switch (ext) {
            case "xls":
            case "mat":
                return <ViewListIcon />
            case "jpg":
            case "jpeg":
            case "png":
            case "gif":
                return <ImageIcon />
            case "wav":
                return <AudiotrackIcon />
        }
        return undefined;
    }

    const title = (<Alert severity="success" icon={<AttachFileIcon />}>
        <AlertTitle>Available assets</AlertTitle>
        For this problem there {assets.length === 1
            ? "is an asset available"
            : `are available ${assets.length} assets`}
        <div className="assets-select-grid">
            {assets.sort().map(i => {
                const cls = `no-transform small ${GetExtraClass(i)}`;
                return <Button startIcon={GetIcon(i)} key={i} href={`${urlPrefix}/${i}`} variant="outlined" size="small"
                    className={cls}>
                    {i}
                </Button>
            })}
        </div>
        <div><em><small>Asset files are automatically available when solution is executed</small></em></div>
    </Alert>);

    return (<LightTooltip title={title} enterTouchDelay={0} leaveTouchDelay={10000}>
        <div className="problem-tag success"><AttachFileIcon />{assets.length}</div>
    </LightTooltip>)
}


interface SubmitSolutionOutputTagProps {
    problem: ICourseProblem;
}

export const SubmitSolutionOutputTag = (props: SubmitSolutionOutputTagProps) => {
    const { problem } = props;
    const output = problem.export;

    const title = (<Alert severity="warning" icon={<QueuePlayNextIcon />}>
        <AlertTitle>Solution must generate specific files!</AlertTitle>
        <div>
            When solution is executed, it must generate {output.length === 1
                ? <>file <div><code>{output[0]}</code></div></>
                : <>these {output.length} files:
                <div>{output.map(i => <div key={i}><code>{i}</code></div>)}</div>
                </>}
        </div>
    </Alert>);

    return (<LightTooltip title={title} enterTouchDelay={0} leaveTouchDelay={10000}>
        <div className="problem-tag warning"><QueuePlayNextIcon />{output.length}</div>
    </LightTooltip>)
}


interface SubmitSolutionTimeTagProps {
    problem: ICourseProblem;
    language: ILanguage;
}

export const SubmitSolutionTimeTag = (props: SubmitSolutionTimeTagProps) => {
    const { problem, language } = props;
    const { timeout, tests } = problem;
    const safeTimeout = timeout < 1 ? 60 : timeout;
    const dg = 2;

    const count = tests.map(i => Math.max(i.random ?? 0, 1)).reduce((a, b) => a + b);

    if (count <= 1) {
        return <></>;
    }

    const scale = (v: number) => {
        return (language.scaleStart + v * language.scaleFactor).toFixed(dg);
    }

    const title = (<Alert severity="warning" icon={<TimelapseIcon />}>
        <AlertTitle>Solution must meet time criteria</AlertTitle>
        <div>
            There are {count} tests with following time restrictions:
            <ul>
                {tests.map((i, j) => <li key={j}>
                    <code>{i.id}{i.random > 1 ? `.{0...${i.random - 1}}` : ``}</code>
                    <ul>
                        <li><code>{i.timeout.toFixed(dg)} sec</code>&nbsp;
                        (<code>{scale(i.timeout)} sec</code> for <code>{language.name}</code>)</li>
                    </ul>
                </li>)}
            </ul>
            <div>All tests must end within <code>{safeTimeout.toFixed(0)} sec</code>&nbsp;
                (<code>{scale(safeTimeout)} sec</code> for <code>{language.name}</code>)
            </div>
        </div>
    </Alert>);

    return (<LightTooltip title={title} enterTouchDelay={0} leaveTouchDelay={10000}>
        <div className="problem-tag warning"><TimelapseIcon />{safeTimeout.toFixed(0)}s</div>
    </LightTooltip>)
}


interface ChangeLayoutTagProps {
    onChange();
}
export const ChangeLayoutTag = (props: ChangeLayoutTagProps) => {
    const { onChange } = props;

    return (<LightTooltip onClick={onChange} title={"Change layout"} enterTouchDelay={0} leaveTouchDelay={10000}>
        <div style={{marginLeft: "auto"}} className="problem-tag layout"><VerticalSplitIcon /></div>
    </LightTooltip>)
}