import { Dialog, DialogTitle, DialogContent, Grid, Button, DialogActions, Typography } from '@mui/material';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { IAppUser, ICcGroup, ICcUserGroup, ICourseProblem } from '../../cc-api';


interface ISimpleGroup {
    name: string;
    objectId: string;
    users: ICcUserGroup[];
    valid: boolean;
}
const getValidGroupsForUser = (user: IAppUser, problem: ICourseProblem) => {
    const { minSize, maxSize } = problem?.collaboration ?? {};
    const meGroup = { objectId: "me", name: "me", users: [{ name: user.id }] } as any as ICcGroup;
    const validGroups = [...user.groups, meGroup]
        .map(i => {
            return {
                name: i.name,
                objectId: i.objectId,
                users: i.users,
                valid: i.users.length >= minSize && i.users.length <= maxSize
            }
        });

    return validGroups as ISimpleGroup[];
}

interface SubmitSolutionGroupSelectProps {
    user: IAppUser;
    problem: ICourseProblem;
    onClick: (groupId?: string) => void;
    onClose: () => void;
}
export const SubmitSolutionGroupSelect = (props: SubmitSolutionGroupSelectProps) => {
    const { user, problem, onClick, onClose } = props;
    const [groupId, setGroupId] = useState<string>();

    return (<Dialog open fullWidth maxWidth="md" onClose={onClose}>
        <DialogTitle>Select Account</DialogTitle>
        <DialogContent>
            <div className="group-selector-grid">
                {getValidGroupsForUser(user, problem).map((i, j) => {
                    const variant = i.objectId === groupId ? "contained" : "outlined";
                    const color = i.objectId === groupId ? "primary" : "secondary";
                    return <Button disabled={!i.valid} onClick={() => setGroupId(i.objectId)} variant={variant} color={color} fullWidth>
                            <Typography variant="button">{i.name}</Typography>
                            <Typography variant="subtitle1">{i.users.map(j => j.name).join(", ")}</Typography>
                    </Button>
                })}
            </div>
        </DialogContent>
        <DialogActions>
            <Button color="secondary" onClick={onClose}>Go back</Button>
            <Button disabled={!groupId} color="primary" onClick={() => onClick(groupId)}>Submit solution</Button>
        </DialogActions>
    </Dialog>)
}