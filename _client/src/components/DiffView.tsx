import React, { Component } from 'react';
import { observable } from "mobx";
import { observer } from "mobx-react";
import { ApiResource } from '../utils/ApiResource';
import { IDiffResult, IDiffPiece } from '../models/DataModel';
import { SimpleLoader } from './SimpleLoader';


interface DiffViewProps {
    objectId: string;
    caseId: string;
}

enum ChangeType {
    Unchanged = 0,
    Deleted = 1,
    Inserted = 2,
    Imaginary = 3,
    Modified = 4
}


@observer
export class DiffView extends React.Component<DiffViewProps, any, any> {

    @observable
    public diffResult: ApiResource<IDiffResult> = new ApiResource("---", false);

    constructor(props: DiffViewProps) {
        super(props);
        const { objectId, caseId } = this.props;
        this.diffResult
            .load(`diff/${objectId}/${caseId}`);
    }

    getLineClass(type: number) {

        switch (type) {
            case ChangeType.Unchanged:
                return "line-unchanged";
            case ChangeType.Deleted:
                return "line-deleted";
            case ChangeType.Inserted:
                return "line-inserted";
            case ChangeType.Imaginary:
                return "line-imaginary";
            case ChangeType.Modified:
                return "line-modified";
        }
    }

    renderLine(line: IDiffPiece, lineNo: number) {
        const className = this.getLineClass(line.type);
        const position = line.position === null ? "" : line.position.toString();
        const text = line.text.trimEnd();
        const whitespaces = Array(line.text.length - text.length).fill(" ");

        return <tr key={lineNo}>
            <td className="blob-num" data-line-number={position}>
            </td>
            <td className={`${className} line blob-code`}>{text}{whitespaces.map((i, j) =><span key={j} className="space" title="trailing space"> </span>)}
            </td>
        </tr>
    }

    render() {
        const { diffResult } = this;
        if (diffResult.isLoading) {
            return <SimpleLoader />
        }

        const diff = diffResult.data as any as IDiffResult;

        return <>
            <table className="source-code diff">
                <tbody>
                    {diff.lines.map((line, lineNo) => this.renderLine(line, lineNo + 1))}
                </tbody>
            </table>
        </>
    }
}