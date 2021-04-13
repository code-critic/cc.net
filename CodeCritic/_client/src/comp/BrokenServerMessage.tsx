import { Alert, AlertTitle } from '@material-ui/lab';
import React, { useEffect, useState } from 'react';
import { useUser } from '../hooks/useUser';

interface BrokenServerMessageProps {
    
}

export const BrokenServerMessage = (props: BrokenServerMessageProps) => {
    const { user } = useUser();
    if (user.serverStatus === "broken") {
        return <Alert variant="filled" severity="error" style={{margin: 10}}>
            <AlertTitle>Server not running properly!</AlertTitle>
            {user.serverMessage}
        </Alert>
    }
    return (<div>
        
    </div>)
}