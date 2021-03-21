import Card from '@material-ui/core/Card';
import React from 'react';
import { IApiError } from '../models/DataModel';

export const renderError = (i: IApiError, j: number) => {
    return <Card className="terminal m-3" elevation={4}>
        <div className="top">
            <div className="btns">
                <span className="circle red"></span>
                <span className="circle yellow"></span>
                <span className="circle green"></span>
            </div>
            <div className="title">{i.name}</div>
        </div>
        <pre className="body red-text m-0">{i.errors.join("\n")}</pre>
        <div className="bottom text-right"><small><em>Visible to admins only</em></small></div>
    </Card>
}