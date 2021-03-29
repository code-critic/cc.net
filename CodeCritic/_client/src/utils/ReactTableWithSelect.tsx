import React from 'react';
import { copyToClipboard } from './ClipboardUtils';
import { transpose } from './MatrixUtils';
// import ReactTable, { CellInfo, Column, TableProps } from "react-table";

let ReactTable: any;
let TableProps: any;
let CellInfo: any;
let Column: any;

export interface NewProps<D> extends React.Component<any> {
    extractData: (key: string) => string[];
    dataChanged: () => void;
    copyHeader?: boolean;
}

function getHeaderId(cellInfo: any): string {
    if (!cellInfo.column.columns) {
        return "";
    }
    var col = cellInfo.column.columns[0];
    return col.id ? col.id : "";
}



export class ReactTableWithSelect<D> extends React.Component<any>  {
    public headerProps: { [name: string]: boolean } = {};

    private getHeaderState(cellInfo: any): boolean {
        return this.headerProps[
            getHeaderId(cellInfo)
        ];
    }

    private copyCol(cellInfo: any) {
        if (cellInfo.column.columns) {
            this.headerProps[getHeaderId(cellInfo)] = !this.getHeaderState(cellInfo);
            this.copyData();
        }
    }

    private copyData() {
        const { extractData } = this.props;
        if (!extractData)
            return;
        try {
            var toCopy: string[][] = [];
            Object.entries(this.headerProps).forEach(([key, val]) => {
                if (val) {
                    if(this.props.copyHeader) {
                        toCopy.push([
                            key,
                            ...extractData(key)
                        ]);
                    } else {
                        toCopy.push([
                            ...extractData(key)
                        ]);
                    }
                }
            });
            var copyText = transpose(toCopy)
                .map(row => row.join("\t")).join("\n");
            copyToClipboard(copyText);
            this.setState({ foo: false });
        } catch (e) {
            console.error(e);
            console.error("could not copy to clipboard");
        }
    }

    private wrappedColumns(columns: any[]): any[] {
        var newCols: any[] = [];
        for (const col of columns) {
            const extraClass = this.headerProps[col.accessor ? col.accessor.toString() : ""] ? "selected" : "";
            col.className = extraClass;
            var newCol: any = {
                columns: [col],
                Header: (cellInfo: any, column: any) => {
                    return <input
                        type="checkbox"
                        onChange={(e) => this.copyCol(cellInfo)}
                        checked={this.getHeaderState(cellInfo)} />
                },
            };
            newCols.push(newCol);
        }
        return newCols;
    }

    render() {
        return <div>
            <ReactTable {...this.props} columns={this.wrappedColumns(this.props.columns || [])} />
        </div>
    }
}