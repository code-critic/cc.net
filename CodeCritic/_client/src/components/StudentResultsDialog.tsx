import React from "react";
import { Dialog, DialogTitle, Box, Grid, Button, DialogContent, ButtonGroup, Paper, Tooltip, IconButton } from "@material-ui/core";
import { commentService, appDispatcher, getUser } from "../init";
import CloseIcon from '@material-ui/icons/Close';
import StudentResults from "./StudentResults";
import { ISingleCourse, ILanguage, ICourseProblem, ICcData } from "../models/DataModel";
import { ToggleButton } from "./ToggleButton";

import CommentIcon from '@material-ui/icons/Comment';
import FeedbackIcon from '@material-ui/icons/Feedback';
import DeleteForeverOutlinedIcon from '@material-ui/icons/DeleteForeverOutlined';
import { AlertDialog } from "./AlertDialog";
import { SimpleLoader } from "./SimpleLoader";
import { GradeSystem } from "../routes/StudentResultList";
import { StudentResultDetail } from "./StudentResultDetail";


interface StudentResultsDialogProps {
    onClose: () => void;
    activeCourse: ISingleCourse;
    activeProblem: ICourseProblem;
    languages: ILanguage[];
    forcedResultId: string;
}

interface StudentResultsDialogForTeacherProps {
    onClose: () => void;
    onRefresh?: () => void;
    result: ICcData;
}

export const StudentResultsDialogForTeacher = (props: StudentResultsDialogForTeacherProps) => {
    const { result, onClose, onRefresh } = props;
    const [items, setItems] = React.useState(commentService.items);

    appDispatcher.register((payload: any) => {
        if (payload.actionType == "commentServiceChanged") {
            setItems([...commentService.items]);
        }
    });

    return <Dialog open={true} fullWidth maxWidth="lg"
        className={commentService.items.length > 0 ? "unsaved" : ""}
        onClose={onClose}
    >
        <DialogTitle>
            <Box padding={2}>
                <Grid container justify="space-between">
                    <Grid item>
                        {result.user}
                    </Grid>
                    {items.length > 0 && <Grid item>
                        <Button onClick={() => commentService.postComments()}
                            variant="contained" color="secondary">
                            Add {items.length} comment{items.length > 1 ? "s" : ""}
                        </Button>
                    </Grid>}
                    <Grid item style={{ minWidth: 500 }}>
                        <GradeSystem item={result} onChange={() => onRefresh ? onRefresh() : null} />
                    </Grid>
                </Grid>
            </Box>
        </DialogTitle>
        <DialogContent>
            <StudentResultDetail
                objectId={result.objectId}
            />
        </DialogContent>
    </Dialog>
}

export const StudentResultsDialog = (props: StudentResultsDialogProps) => {
    const { onClose, activeCourse, activeProblem, languages, forcedResultId } = props;

    const [items, setItems] = React.useState(commentService.items);
    const [filters, setFilters] = React.useState({ comments: false, review: false });
    const [discardDialog, setDiscardDialog] = React.useState(false);
    const [user, setUser] = React.useState(getUser());

    appDispatcher.register((payload: any) => {
        if (payload.actionType == "userChanged") {
            setUser(getUser());
        }
    });

    if (!user.role) {
        return <SimpleLoader />
    }

    appDispatcher.register((payload: any) => {
        if (payload.actionType == "commentServiceChanged") {
            setItems([...commentService.items]);
        }
    });

    return <Dialog className={items.length > 0 ? "unsaved" : ""}
        open={true}
        onClose={() => onClose()}
        maxWidth="lg" fullWidth>
        <DialogTitle>
            <Box padding={2}>
                <Grid container justify="space-between">
                    <Grid item>
                        {user.username} ({user.id})
                    </Grid>
                    <Grid item>
                        {items.length > 0 &&
                            <ButtonGroup variant="contained" color="primary">
                                <Button onClick={() => commentService.postComments()}>
                                    Add {items.length} comment{items.length > 1 ? "s" : ""}
                                </Button>
                                <Button color="secondary" onClick={() => setDiscardDialog(true)}>
                                    <DeleteForeverOutlinedIcon />
                                </Button>
                                {discardDialog &&
                                    <AlertDialog
                                        title="Confirm"
                                        message="Do you really want to discard prepared comments?"
                                        onClose={() => setDiscardDialog(false)}
                                        onConfirm={() => commentService.discardComments()} />
                                }
                            </ButtonGroup>}
                        <Button onClick={() => onClose()}>
                            <CloseIcon />
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </DialogTitle>
        <DialogContent>
            <div className="button-group with-label" data-title="Filter Results">
                <ToggleButton variant="text" onClick={() => setFilters({ ...filters, comments: !filters.comments })}
                    title="Toggle results with comments only">
                    <CommentIcon />
                </ToggleButton>

                <ToggleButton variant="text" onClick={() => setFilters({ ...filters, review: !filters.review })}
                    title="Toggle results with review request only">
                    <FeedbackIcon />
                </ToggleButton>
            </div>

            <StudentResults
                filters={filters}
                course={activeCourse.course}
                year={activeCourse.year}
                problem={activeProblem.id}
                user={user.id}
                languages={languages}
                forcedResultId={forcedResultId}
            />
        </DialogContent>
    </Dialog>
}