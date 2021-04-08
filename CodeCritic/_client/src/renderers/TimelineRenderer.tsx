import * as React from 'react';
import { useEffect, useState } from 'react';

import { Dialog, DialogContent, Fade, IconButton, makeStyles } from '@material-ui/core';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import DeveloperModeIcon from '@material-ui/icons/DeveloperMode';
import FingerprintIcon from '@material-ui/icons/Fingerprint';
import SpeakerNotesIcon from '@material-ui/icons/SpeakerNotes';
import TimerIcon from '@material-ui/icons/Timer';

import { ICcData, ICcDataCaseResult, IDiffResultComposite, IDiffResultLine } from '../cc-api';
import { getStatus } from '../utils/StatusUtils';
import { IconClassSubresult } from './IconClass';
import { ChangeType, ProcessStatusCodes, ProcessStatusStatic } from '../models/Enums';
import FlagIcon from '@material-ui/icons/Flag';
import { LightTooltip } from './LightTooltip';
import { useOpenClose } from "../hooks/useOpenClose";
import { SimpleLoader, SimplePacmanLoader } from "../components/SimpleLoader";
import { notifications } from "../utils/notifications";
import { CodeCritic } from '../api';

interface TimelineRendererProps {
    result: ICcData,
    showExtra?: boolean,
    miniMode?: boolean,
}

export const TimelineRenderer = (props: TimelineRendererProps) => {
    const { showExtra = false, miniMode = false, result } = props;

    const subresults = result.results;
    const N = subresults.length;
    const caseRadius = miniMode ? 25 : 40;
    const maxWidth = miniMode ? 300 : 800;
    const miniCls = miniMode ? "mini" : "";

    const minW = miniMode ? 10 : 30;
    const maxW = miniMode ? 50 : 80;

    const guess = N > 0
        ? (maxWidth - N * caseRadius) / (N - 1)
        : 100;

    const connectorLength = Math.min(maxW, Math.max(minW, guess));
    const ws = miniMode ? { width: maxWidth } : {};

    return (<div className={`subresults-timeline-wrapper ${miniCls}`} style={ws}>
        {subresults?.map((i, j) => {
            const status = getStatus(i.status);
            const isRunning = status.code == ProcessStatusCodes.Running;

            return (<span key={j}>
                <Fade in timeout={250} style={{ transitionDelay: `${j * 100}ms` }}>
                    <span className="subresults-timeline">
                        {subresults.length === 1
                        ? <>
                            {isRunning && <SimplePacmanLoader />}
                            {!isRunning && <>
                                <SubresultDot subresult={i} showExtra={showExtra} result={result}/>
                                &nbsp; {i.duration.toFixed(3)} sec
                            </>}
                        </>
                        : <>
                            <SubresultDot subresult={i} showExtra={showExtra} result={result}/>
                        </>}
                        {j !== subresults.length - 1 && <>
                            <span style={{ width: connectorLength }}
                                  className={`connector status-${status.name}`}> </span>
                        </>}
                    </span>
                </Fade>
            </span>)
        })}
    </div>)
}

interface SubresultDotProps {
    result: ICcData;
    subresult: ICcDataCaseResult,
    showExtra: boolean;
}

const SubresultDot = (props: SubresultDotProps) => {
    const { subresult, showExtra, result } = props;
    const [ diffOpen, openDiff, closeDiff ] = useOpenClose();

    const id = subresult.case;
    const IconClass = IconClassSubresult(subresult);
    const status = getStatus(subresult.status);

    return (<span className={`case status-${status.name}`}>
        {diffOpen && <DiffView onClose={closeDiff} subresult={subresult} result={result}/>}
        <LightTooltip interactive title={<span className="subresult-tooltip">
            <div className="subresult-tooltip-item">
                <span className="subresult-tooltip-item-key">
                    <FingerprintIcon/>&nbsp;Test:
                    </span>
                <code>{subresult.case}</code>
            </div>
            <div className="subresult-tooltip-item">
                <span className="subresult-tooltip-item-key">
                    <FlagIcon/>&nbsp;Status:
                    </span>
                <code>{ProcessStatusStatic.All.find(i => i.value == subresult.status).name}</code>
            </div>

            <div className="subresult-tooltip-item">
                <span className="subresult-tooltip-item-key">
                    <TimerIcon/>&nbsp;Duration:
                    </span>
                <code>{subresult.duration?.toFixed(3) ?? "??"} sec</code>
            </div>

            {subresult.message && <div className="subresult-tooltip-item">
                <span className="subresult-tooltip-item-key">
                    <SpeakerNotesIcon/>&nbsp;Output:
                    </span>
                <code>{subresult.message}</code>
            </div>}

            {showExtra && <>
                {subresult.messages?.length > 0 && <div className="subresult-tooltip-item">
                    <span className="subresult-tooltip-item-key">
                        <DeveloperModeIcon/>&nbsp;Log:
                        </span>
                    <pre>{subresult.messages.join("\n")}</pre>
                </div>}

                {subresult.command && <div className="subresult-tooltip-item">
                    <span className="subresult-tooltip-item-key">
                        <AttachMoneyIcon/>&nbsp;Command:
                        </span>
                    <pre>{subresult.command}</pre>
                </div>}
            </>}
        </span>}>
            <IconButton
                onClick={openDiff}
                aria-owns={id}
                aria-haspopup="true"
                aria-describedby={id}>
                <IconClass/>
            </IconButton>
        </LightTooltip>
    </span>)
}

interface DiffViewProps {
    onClose(): void;
    result: ICcData;
    subresult: ICcDataCaseResult;
}

const DiffView = (props: DiffViewProps) => {
    const { onClose, subresult, result } = props;
    const [ diff, setDiff ] = useState<IDiffResultComposite>();
    const hideLegend = false;

    const renderLine = (line: IDiffResultLine, lineNo: number) => {
        return <tr key={lineNo}>
            <td className="blob-num" data-line-number={lineNo}>
            </td>
            <td className={`line-${line.type} line blob-code`}>{line.generated}
            </td>
            <td className={`line-${line.type} line blob-code`}>{line.reference}
            </td>
        </tr>
    }

    useEffect(() => {
        (async () => {
            try {
                const axiosResponse = await CodeCritic.api.diffDetail(result.objectId, subresult.case);
                const data = axiosResponse.data;
                setDiff(data);
            } catch (e) {
                notifications.error(`Could not compare files, ${e}`);
                onClose();
            }
        })();
    }, []);

    if (!diff) {
        return <SimpleLoader/>
    }

    return <Dialog open onClose={onClose}>
        <DialogContent>
            <table className="source-code diff">
                <thead>
                <tr>
                    <th></th>
                    <th>Generated</th>
                    <th>Reference</th>
                </tr>
                </thead>
                <tbody>
                {diff.lines.map((line, lineNo) => renderLine(line, lineNo + 1))}
                </tbody>
            </table>
            {!hideLegend && <div className="diff-legend">
                <hr/>
                <div className="diff-legend-items">
                        <span className="line">
                            <span className="square line-1"> </span>
                            <span className="label">Correct</span>
                        </span>
                    <span className="line">
                            <span className="square line-2"> </span>
                            <span className="label">Wrong</span>
                        </span>
                </div>
            </div>}
        </DialogContent>
    </Dialog>
}