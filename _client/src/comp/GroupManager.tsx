import React, { useState, useEffect } from 'react'
import { useResource } from '../components/useResource'
import { SimpleLoader } from '../components/SimpleLoader';
import { Schema, ObjectEditor, ArrayEditor, SchemaType } from '../components/ObjectEditor';
import { ICcGroup, ICcUserGroup } from '../models/DataModel';
import { Table, TableCell, TableHead, TableBody, TableRow, Button, Dialog, DialogTitle, DialogContent, Input, TextField, DialogActions, RadioGroup, FormControlLabel, Radio, Container } from '@material-ui/core';
import { openCloseState, useOpenClose } from '../utils/StateUtils';
import { getUser, httpClient } from '../init';
import { CcUserGroupStatus } from '../models/Enums';
import { groupBy } from '../utils/arrayUtils';


const model = Schema.ObjectType({
    name: Schema.StringType(),
    status: Schema.EnumType({ values: ['NotConfirmed', 'Confirmed', 'Rejected'] }),
    users: Schema.ArrayType(
        Schema.ObjectType({
            name: Schema.StringType(),
            status: Schema.EnumType({ values: ['NotConfirmed', 'Confirmed', 'Rejected'] }),
        })
    )
});


interface UserElementProps {
    users: ICcUserGroup[];
}
const UserElement = (props: UserElementProps) => {
    const { users } = props;
    const mapUser = (user: ICcUserGroup) => {
        return <span key={user.name} className={`group-user-status group-user-status-${user.status}`}>{user.name}</span>
    }
    return (<div>
        {users.map(i => mapUser(i))}
    </div>)
}
interface GroupManagerProps {

}
export const GroupManager = (props: GroupManagerProps) => {
    const [rnd, setRnd] = useState(Math.random());
    const groups = useResource<ICcGroup[]>(`student/group?r${rnd}`);
    const [edit, openEdit, closeEdit] = useOpenClose(false);
    const [newGroup, setNewGroup] = useState<ICcGroup>({} as any);
    const [isEditMode, setIsEditMode] = useState(true);

    if (groups === undefined) {
        return <SimpleLoader />
    }

    const openEditGroupDialog = (index) => {
        setIsEditMode(true);
        setNewGroup({ ...groups[index] });
        openEdit();
    }

    const openNewGroupDialog = () => {
        setIsEditMode(false);
        const newGrp: Partial<ICcGroup> = {
            name: "skupina",
            owner: getUser().id, users: [
            ]
        };
        setNewGroup(newGrp as any);
        openEdit();
    }

    const updateNewGroup = () => {
        setNewGroup({ ...newGroup });
    }

    const saveNewGroup = () => {
        httpClient.fetch("student/group-new", newGroup, "post")
            .then(i => {
                setRnd(Math.random());
            })
        closeEdit();
    }

    const editGroup = () => {
        newGroup.oid = newGroup.objectId;
        httpClient.fetch("student/group-edit", newGroup)
            .then(i => {
                setRnd(Math.random());
            })
        closeEdit();
    }

    const deleteGroup = () => {
        httpClient.fetch(`student/group-delete/${newGroup.objectId}`)
            .then(i => {
                setRnd(Math.random());
            })
        closeEdit();
    }

    const updateStatus = (objectId: string, myGrp: ICcUserGroup) => {
        httpClient.fetch(`student/group-status`, { oid: objectId, ...myGrp })
            .then(i => {
                setRnd(Math.random());
            })
    }

    const users = [
        ...(newGroup?.users ?? []),
        { name: "", status: CcUserGroupStatus.NotConfirmed as any }
    ];



    return (<Container>
        {(edit && newGroup) && <Dialog open={edit} onClose={closeEdit} fullWidth maxWidth="md">
            <DialogTitle>{isEditMode ? "Edit Group" : "New Group"}</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Group Name"
                    onChange={e => { newGroup.name = e.target.value.substr(0, 32); updateNewGroup() }}
                    value={newGroup.name}
                    fullWidth
                />
                <div>
                    {users.map((i, j) => {
                        const updateUserList = () => {
                            newGroup.users = [...users.filter(i => !!i.name)];
                            updateNewGroup();
                        };

                        return <TextField key={j} style={{ marginRight: 5 }}
                            margin="dense" variant="outlined" size="small"
                            label={`User ${j + 1}`}
                            onChange={e => { i.name = e.target.value.substr(0, 32); updateUserList() }}
                            value={i.name}
                        />
                    })}
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={closeEdit} color="primary">Cancel</Button>
                {isEditMode && <Button onClick={deleteGroup} color="secondary">Delete Group</Button>}
                {isEditMode && <Button onClick={editGroup} disabled={(users.length - 1) < 1} color="primary">
                    Save and Invite {(newGroup.users.length)} users
                </Button>}
                {!isEditMode && <Button onClick={saveNewGroup} disabled={(users.length - 1) < 1} color="primary">
                    Save and Invite {(newGroup.users.length)} users
                </Button>}
            </DialogActions>
        </Dialog>}
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Owner</TableCell>
                    <TableCell>Users</TableCell>
                    <TableCell>Edit</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {groups.map((i, j) => {
                    const me = getUser().id;
                    const myGrp = i.users.find(k => k.name == me);

                    if (!myGrp) {
                        // weird
                        return <></>
                    }
                    const myStatus = myGrp.status;

                    return <TableRow key={j}>
                        <TableCell>{i.name}</TableCell>
                        <TableCell>{i.owner}</TableCell>
                        <TableCell><UserElement users={i.users} /></TableCell>
                        <TableCell>
                            {i.isLocked && <Button disabled>Cannot change active group</Button>}
                            {!i.isLocked &&
                                <>
                                    {me == i.owner && <Button disabled={i.isLocked} onClick={i => openEditGroupDialog(j)}>Edit Group</Button>}
                                    {me != i.owner && <RadioGroup value={myStatus} onChange={e => { myGrp.status = Number(e.target.value) as any; updateStatus(i.objectId, myGrp) }}>
                                        <FormControlLabel value={CcUserGroupStatus.Confirmed} control={<Radio />} label="Accept" />
                                        <FormControlLabel value={CcUserGroupStatus.Rejected} control={<Radio />} label="Reject" />
                                    </RadioGroup>}
                                </>
                            }
                        </TableCell>
                    </TableRow>
                })}
            </TableBody>
        </Table>
        <Button onClick={openNewGroupDialog}>Create New Group</Button>
    </Container>)
}