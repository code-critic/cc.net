import { Button, Container, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Radio, RadioGroup, Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { API } from '../api';
import { SimpleLoader } from '../components/SimpleLoader';
import { useRefresh } from '../hooks/useRefresh';
import { useUser } from '../hooks/useUser';
import { ICcGroup, ICcUserGroup } from '../models/DataModel';
import { CcUserGroupStatus } from '../models/Enums';
import { useOpenClose } from "../hooks/useOpenClose";


// const model = Schema.ObjectType({
//     name: Schema.StringType(),
//     status: Schema.EnumType({ values: ['NotConfirmed', 'Confirmed', 'Rejected'] }),
//     users: Schema.ArrayType(
//         Schema.ObjectType({
//             name: Schema.StringType(),
//             status: Schema.EnumType({ values: ['NotConfirmed', 'Confirmed', 'Rejected'] }),
//         })
//     )
// });


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
    const [groups, setGroups] = useState<ICcGroup[]>();
    const [edit, openEdit, closeEdit] = useOpenClose(false);
    const [newGroup, setNewGroup] = useState<ICcGroup>({} as any);
    const [isEditMode, setIsEditMode] = useState(true);
    const { counter, refresh } = useRefresh();
    const { user } = useUser();

    useEffect(() => {
        (async () => {
            const axiosReponse = await API.get<ICcGroup[]>(`student/group`);
            setGroups(axiosReponse.data);
        })()
    }, [ counter ]);

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
            owner: user.id, users: [
            ]
        };
        setNewGroup(newGrp as any);
        openEdit();
    }

    const updateNewGroup = () => {
        setNewGroup({ ...newGroup });
    }

    const saveNewGroup = async () => {
        await API.post("student/group-new", newGroup);
        refresh();
        closeEdit();
    }

    const editGroup = async () => {
        newGroup.oid = newGroup.objectId;
        await API.post("student/group-edit", newGroup);
        refresh();
        closeEdit();
    }

    const deleteGroup = async () => {
        await API.get(`student/group-delete/${newGroup.objectId}`);
        refresh();
        closeEdit();
    }

    const updateStatus = async (objectId: string, myGrp: ICcUserGroup) => {
        await API.post(`student/group-status`, { oid: objectId, ...myGrp });
        refresh();
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
                    const me = user.id;
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