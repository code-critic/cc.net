import React from "react";
import { Button, Dialog, DialogTitle, DialogContentText, DialogContent, DialogActions } from "@material-ui/core";


interface AlertDialogProps {
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}
export const AlertDialog = (props: AlertDialogProps) => {
    const { onClose, onConfirm, title, message } = props;

    return <>
        <Dialog open={true} onClose={onClose}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    {message}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Cancel
                </Button>
                <Button onClick={() => {
                    onConfirm();
                    onClose();
                }}
                    color="primary" autoFocus>
                    Yes
                </Button>
            </DialogActions>
        </Dialog>
    </>
}