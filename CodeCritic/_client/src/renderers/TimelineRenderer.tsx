import * as React from 'react';
import { useState } from 'react';

import { Fade, IconButton, makeStyles } from '@material-ui/core';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import DeveloperModeIcon from '@material-ui/icons/DeveloperMode';
import FingerprintIcon from '@material-ui/icons/Fingerprint';
import SpeakerNotesIcon from '@material-ui/icons/SpeakerNotes';
import TimerIcon from '@material-ui/icons/Timer';

import { ICcDataCaseResult } from '../models/DataModel';
import { getStatus } from '../utils/StatusUtils';
import { IconClassSubresult } from './IconClass';
import { ProcessStatusStatic } from '../models/Enums';
import FlagIcon from '@material-ui/icons/Flag';
import { LightTooltip } from './LightTooltip';

interface TimelineRendererProps {
    subresults: ICcDataCaseResult[],
    showExtra?: boolean,
    miniMode?: boolean,
}
export const TimelineRenderer = (props: TimelineRendererProps) => {
    const { subresults, showExtra=false, miniMode=false } = props;

    const N = subresults.length;
    const caseRadius = miniMode ? 25 : 40;
    const maxWidth = miniMode ? 300 : 800;
    const miniCls = miniMode ? "mini" : "";
    
    const minW = miniMode ? 10 : 30;
    const maxW = miniMode ? 70 : 170;

    const guess = N > 0
        ? (maxWidth - N * caseRadius) / (N - 1)
        : 100;

    const connectorLength = Math.min(maxW, Math.max(minW, guess));
    const ws = miniMode ? {width: maxWidth} : { };

    return (<div className={`subresults-timeline-wrapper ${miniCls}`} style={ws}>
        {subresults?.map((i, j) => {
            const status = getStatus(i.status);

            return (<span key={j} >
                <Fade in timeout={250} style={{ transitionDelay: `${j * 100}ms` }}>
                    <span className="subresults-timeline">
                        <SubresultDot subresult={i} showExtra={showExtra} />
                        {subresults.length === 1 && <>
                            &nbsp; {i.duration.toFixed(3)} sec
                        </>}
                        {j !== subresults.length - 1 && <>
                            <span style={{ width: connectorLength }} className={`connector status-${status.name}`}> </span>
                        </>}
                    </span>
                </Fade>
            </span>)
        })}
    </div>)
}

interface SubresultDotProps {
    subresult: ICcDataCaseResult,
    showExtra: boolean;
}
const SubresultDot = (props: SubresultDotProps) => {
    const { subresult, showExtra } = props;
    const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
    const open = Boolean(anchorEl);

    const id = open ? subresult.case : undefined;
    const IconClass = IconClassSubresult(subresult);
    const status = getStatus(subresult.status);

    return (<span className={`case status-${status.name}`}>
        <LightTooltip interactive title={<span className="subresult-tooltip">
            <div className="subresult-tooltip-item">
                <span className="subresult-tooltip-item-key">
                    <FingerprintIcon />&nbsp;Test:
                    </span>
                <code>{subresult.case}</code>
            </div>
            <div className="subresult-tooltip-item">
                <span className="subresult-tooltip-item-key">
                    <FlagIcon />&nbsp;Status:
                    </span>
                <code>{ProcessStatusStatic.All.find(i => i.value == subresult.status).name}</code>
            </div>

            <div className="subresult-tooltip-item">
                <span className="subresult-tooltip-item-key">
                    <TimerIcon />&nbsp;Duration:
                    </span>
                <code>{subresult.duration?.toFixed(3) ?? "??"} sec</code>
            </div>

            {subresult.message && <div className="subresult-tooltip-item">
                <span className="subresult-tooltip-item-key">
                    <SpeakerNotesIcon />&nbsp;Output:
                    </span>
                <code>{subresult.message}</code>
            </div>}

            {showExtra && <>
                {subresult.messages?.length > 0 && <div className="subresult-tooltip-item">
                    <span className="subresult-tooltip-item-key">
                        <DeveloperModeIcon />&nbsp;Log:
                        </span>
                    <pre>{subresult.messages.join("\n")}</pre>
                </div>}

                {subresult.command && <div className="subresult-tooltip-item">
                    <span className="subresult-tooltip-item-key">
                        <AttachMoneyIcon />&nbsp;Command:
                        </span>
                    <pre>{subresult.command}</pre>
                </div>}
            </>}
        </span>}>
            <IconButton
                aria-owns={id}
                aria-haspopup="true"
                aria-describedby={id}>
                <IconClass />
            </IconButton>
        </LightTooltip>
    </span>)
}