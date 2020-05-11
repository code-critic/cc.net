import React from "react";
import { Dialog, DialogTitle, Box, Grid, Button, DialogContent, ButtonGroup, Paper, Tooltip, IconButton } from "@material-ui/core";
import { commentService, appDispatcher, currentUser } from "../init";
import CloseIcon from '@material-ui/icons/Close';
import StudentResults from "./StudentResults";
import { ISingleCourse, ILanguage, ICourseProblem } from "../models/DataModel";
import { ToggleButton } from "./ToggleButton";

import CommentIcon from '@material-ui/icons/Comment';
import FeedbackIcon from '@material-ui/icons/Feedback';
import DeleteForeverOutlinedIcon from '@material-ui/icons/DeleteForeverOutlined';
import { AlertDialog } from "./AlertDialog";


interface StudentResultsDialogProps {
    onClose: () => void;
    activeCourse: ISingleCourse;
    activeProblem: ICourseProblem;
    languages: ILanguage[];
    forcedResultId: string;
}

export const StudentResultsDialog = (props: StudentResultsDialogProps) => {
    const [items, setItems] = React.useState(commentService.items);
    const [filters, setFilters] = React.useState({ comments: false, review: false });
    const [discardDialog, setDiscardDialog] = React.useState(false);

    const { onClose, activeCourse, activeProblem, languages, forcedResultId } = props;

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
                        {currentUser.username} ({currentUser.id})
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
                user={currentUser.id}
                languages={languages}
                forcedResultId={forcedResultId}
            />
        </DialogContent>
    </Dialog>
}