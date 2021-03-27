import Card from '@material-ui/core/Card';
import { IApiError } from '../models/DataModel';
import React from 'react';

export const renderError = (i: IApiError, j?: number, adminOnly: boolean=true) => {
    return <Card key={j ?? 0} className="terminal m-3" elevation={4}>
        <div className="top">
            <div className="btns">
                <span className="circle red"></span>
                <span className="circle yellow"></span>
                <span className="circle green"></span>
            </div>
            <div className="title">{i.name}</div>
        </div>
        <pre className="body red-text m-0">{i.errors.join("\n")}</pre>
        {adminOnly && <div className="bottom text-right"><small><em>Visible to admins only</em></small></div>}
    </Card>
}


export const renderErrorForAdmin = (i: IApiError, j: number) => {
    return renderError(i, j, true);
}