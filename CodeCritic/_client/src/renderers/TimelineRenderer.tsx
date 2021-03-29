import * as React from 'react';

import { Fade, IconButton, makeStyles, Popover, Theme, Tooltip, withStyles, Zoom } from '@material-ui/core';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import DeveloperModeIcon from '@material-ui/icons/DeveloperMode';
import FingerprintIcon from '@material-ui/icons/Fingerprint';
import SpeakerNotesIcon from '@material-ui/icons/SpeakerNotes';
import TimerIcon from '@material-ui/icons/Timer';

import { ICcDataCaseResult } from '../models/DataModel';
import { getStatus } from '../utils/StatusUtils';
import { IconClassSubresult } from './IconClass';

// const LightTooltip = withStyles((theme: Theme) => ({
//     tooltip: {
//         backgroundColor: theme.palette.common.white,
//         color: 'rgba(0, 0, 0, 0.87)',
//         boxShadow: theme.shadows[3],
//         fontSize: 11,
//         minWidth: 300,
//         maxWidth: 800,
//         overflow: "auto"
//     },
// }))(Tooltip);


interface TimelineRendererProps {
    subresults: ICcDataCaseResult[],
    showExtra: boolean,
}
export const TimelineRenderer = (props: TimelineRendererProps) => {
    const { subresults, showExtra } = props;

    const N = subresults.length;
    const caseRadius = 40;

    const guess = N > 0
        ? (800 - N * caseRadius) / (N - 1)
        : 100;

    const connectorLength = Math.min(170, Math.max(30, guess));

    return (<div className="subresults-timeline-wrapper">
        {subresults?.map((i, j) => {
            const status = getStatus(i.status);

            return (<span key={j}>
                <Fade in timeout={250} style={{ transitionDelay: `${j * 100}ms` }}>
                    <span className="subresults-timeline">
                        <SubresultDot subresult={i} showExtra={showExtra} />
                        {j !== subresults.length - 1 && <>
                            <span style={{ width: connectorLength }} className={`connector status-${status.name}`}></span>
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
const useStyles = makeStyles(theme => ({
    popover: {
        pointerEvents: "none",
        fontSize: "0.8rem",
    },
    paper: {
        pointerEvents: "all",
        padding: theme.spacing(1)
    }
}));

const SubresultDot = (props: SubresultDotProps) => {
    const { subresult, showExtra } = props;
    const classes = useStyles();
    const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
    const [locked, setLocked] = React.useState(false);
    const open = Boolean(anchorEl);

    const id = open ? subresult.case : undefined;
    const IconClass = IconClassSubresult(subresult);
    const status = getStatus(subresult.status);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (locked) {
            handleClose();
            setLocked(false);
        } else {
            setAnchorEl(event.currentTarget);
            setLocked(true);
        }
    };

    const handleClose = () => {
        setAnchorEl(null);
        setLocked(false);
    };

    const handlePopoverOpen = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        if (!locked) {
            setAnchorEl(event.currentTarget);
        }
    };

    const handlePopoverClose = () => {
        if (!locked) {
            setAnchorEl(null);
        }
    };

    return (<span className={`case status-${status.name}`}>
        <IconButton
            aria-owns={id}
            aria-haspopup="true"
            aria-describedby={id}
            onMouseEnter={handlePopoverOpen}
            onMouseLeave={handlePopoverClose}
            onClick={handleClick}>
            <IconClass />
        </IconButton>
        <Popover
            id={id}
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
            }}
            className={classes.popover}
            classes={{
                paper: classes.paper
            }}>
            <span className="subresult-tooltip">
                <div className="subresult-tooltip-item">
                    <span className="subresult-tooltip-item-key">
                        <FingerprintIcon />&nbsp;Test:
                </span>
                    <code>{subresult.case}</code>
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
                    {subresult.messages?.length && <div className="subresult-tooltip-item">
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
            </span>
        </Popover>
    </span>)
}