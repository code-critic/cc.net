import * as React from 'react';

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Slider,
    TextField,
} from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import MoodBadIcon from '@mui/icons-material/MoodBad';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import StarIcon from '@mui/icons-material/Star';

import { CodeCritic } from '../../api';
import { ICcData, IMarkSolutionItem } from '../../cc-api';
import { SubmissionStatus } from '../../models/Enums';
import { notifications } from '../../utils/notifications';

const marks = [
    {
        valueFunc: (i: number) => i >= 0 && i < 50,
        value: 0,
        label: "",
        valueName: 'Unacceptable',
    },
    {
        valueFunc: (i: number) => i >= 50 && i < 60,
        value: 50,
        label: <MoodBadIcon />,
        valueName: 'Barely acceptable',
    },
    {
        valueFunc: (i: number) => i >= 60 && i < 70,
        value: 60,
        label: <SentimentVeryDissatisfiedIcon />,
        valueName: 'Satisfactory',
    },
    {
        valueFunc: (i: number) => i >= 70 && i < 80,
        value: 70,
        label: <SentimentDissatisfiedIcon />,
        valueName: 'Good',
    },
    {
        valueFunc: (i: number) => i >= 80 && i < 90,
        value: 80,
        label: <SentimentSatisfiedIcon />,
        valueName: 'Excellent',
    },
    {
        valueFunc: (i: number) => i >= 90 && i < 100,
        value: 90,
        label: <SentimentVerySatisfiedIcon />,
        valueName: 'Exceptional',
    },
    {
        valueFunc: (i: number) => i == 100,
        value: 100,
        label: <StarIcon />,
        valueName: 'Perfect',
    },
];

const PrettoSlider = withStyles({
    root: {
        height: 8,
    },
    thumb: {
        height: 24,
        width: 24,
        backgroundColor: '#fff',
        border: '2px solid currentColor',
        marginTop: -8,
        marginLeft: -12,
        '&:focus, &:hover, &$active': {
            boxShadow: 'inherit',
        },
    },
    markLabel: {
        marginTop: 10
    },
    active: {},
    valueLabel: {
        textAlign: 'center',
        width: 150,
        left: -55,
        top: -25,
        '& *': {
            background: 'transparent',
            color: '#000',
            width: 150,
        },
    },
    track: {
        height: 8,
        borderRadius: 4,
    },
    rail: {
        height: 8,
        borderRadius: 4,
    },
})(Slider);

interface SolutionResultViewGradeDialogProps {
    objectId: string;
    onClose(): void;
}
export const SolutionResultViewGradeDialog = (props: SolutionResultViewGradeDialogProps) => {
    const { objectId, onClose } = props;
    const [result, setResult] = React.useState<ICcData>();
    const [points, setPoints] = React.useState(0);
    const [comment, setComment] = React.useState("");

    React.useEffect(() => {
        (async () => {
            const response = await CodeCritic.api.resultGetDetail(objectId);
            const result = response.data.data;
            setPoints(result.points);
            setComment(result.gradeComment);
            setResult(result);
        })();
    }, [ ]);

    if (!result) {
        return <></>
    }

    const authors = result.userOrGroupUsers.join(", ");
    const isLate = result.submissionStatus == SubmissionStatus.Late;

    const getMarkName = (value: number) => {
        const mark = marks.find(i => i.valueFunc(value));
        return `${mark!.valueName} (${value})`;
    }

    const saveGrade = async () => {
        const grade:IMarkSolutionItem = { comment, points, objectId }
        try {
            const data = await CodeCritic.api.saveGradeCreate(grade);
            notifications.success(`Saved! ${data.data.count} notification(s) sent`);
            onClose();
        } catch (error) {
            notifications.error(`Error while saving: ${error}`);
        }
    }

    return (
        <Dialog open={!!result} onClose={onClose} maxWidth="md" fullWidth className={`grade-dialog ${isLate ? "is-late" : ""}`}>
            <DialogTitle>
                Grade solution #{result.attempt} from {authors}
                {isLate && <span>Solution was handed over after the soft deadline</span>}
            </DialogTitle>
            <DialogContent>
                <div className="grade-slider">
                    <PrettoSlider marks={marks} className="mb-0"
                        onChange={(_, i) => setPoints(i as number)}
                        value={points}
                        step={1}
                        min={0}
                        max={100}
                        valueLabelFormat={getMarkName}
                        valueLabelDisplay="on" />

                    <TextField
                        className="grade-comment"
                        fullWidth
                        label="Optional comment"
                        variant="filled"
                        multiline
                        rows={3}
                        maxRows={4}
                        value={comment ?? ""}
                        onChange={e => setComment(e.target.value)}
                    />
                </div>
            </DialogContent>
            <DialogActions>
                <Button color="secondary" onClick={onClose}>Cancel</Button>
                <Button color="primary" onClick={saveGrade}>Save</Button>
            </DialogActions>
        </Dialog>
    );
}