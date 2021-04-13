import { Menu, MenuItem } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { CodeCritic } from '../api';
import { useUser } from '../hooks/useUser';
import { updateUser } from '../init';
import { notifications } from '../utils/notifications';


type StatusType = "running" | "broken";

interface NavMenuAdminProps {
    open: boolean;
    onClose(): void;
    anchorEl: Element;
}
export const NavMenuAdmin = (props: NavMenuAdminProps) => {
    const { open, anchorEl, onClose } = props;
    const { user, isRoot } = useUser();
    const status = user.serverStatus as StatusType;

    if (!isRoot) {
        return <></>
    }

    const changeServerState = async () => {

        const newState: StatusType = status === "broken" ? "running" : "broken";
        const password = prompt("Sys admin passwd: ", "");
        const message = newState === "broken" ? 
            prompt("Optional enter error message", `
                Our server could not establish a connection to the remote database server.
                We are trying to fix this ASAP.`.trim())
            : "";


        try {
            const result = await CodeCritic.admin.changeServerStateCreate({
                password, newState, message
            })
            updateUser({ ...user, serverStatus: newState, serverMessage: message });
            onClose();
        } catch (error) {
            notifications.error("Wrong password");
        }
    }

    return (<Menu
        open={open}
        onClose={onClose}
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        keepMounted>
        <MenuItem disabled>
            <small>Server is currently&nbsp;<strong>{status}</strong></small>
        </MenuItem>
        <MenuItem onClick={changeServerState}>
            Mark as &nbsp;<strong>{status === "broken" ? "running" : "broken"}</strong>
        </MenuItem>
    </Menu>)
}