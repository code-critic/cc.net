import { observable } from "mobx";
import { observer } from "mobx-react";
import React from 'react';
import { IDiffResultComposite, IDiffResultLine } from '../models/DataModel';
import { ChangeType } from '../models/Enums';
import { ApiResource } from '../utils/ApiResource';
import { SimpleLoader } from './SimpleLoader';




interface DiffViewProps {
    objectId: string;
    caseId: string;
    hideLegend?: boolean;
}

@observer
export class DiffView extends React.Component<DiffViewProps, any, any> {

    @observable
    public diffResult: ApiResource<IDiffResultComposite> = new ApiResource("---", false);

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

    renderLine(line: IDiffResultLine, lineNo: number) {
        const className = this.getLineClass(line.type);
        return <tr>
            <td className="blob-num" data-line-number={lineNo}>
            </td>
            <td className={`line-${line.type} line blob-code`}>{line.generated}
            </td>
            <td className={`line-${line.type} line blob-code`}>{line.reference}
            </td>
        </tr>
        /*const position = line.position === null ? "" : line.position.toString();
        const text = line.text.trimEnd();
        const whitespaces = Array(line.text.length - text.length).fill(" ");

        return <tr key={lineNo}>
            <td className="blob-num" data-line-number={position}>
            </td>
            <td className={`${className} line blob-code`}>{text}{whitespaces.map((i, j) => <span key={j} className="space" title="trailing space"> </span>)}
            </td>
        </tr>*/
    }

    render() {
        const { diffResult } = this;
        const { hideLegend } = this.props;

        if (diffResult.isLoading) {
            return <SimpleLoader />
        }

        const diff = diffResult.data as any as IDiffResultComposite;

        return <>
            <table className="source-code diff">
                <thead>
                    <tr>
                        <th></th>
                        <th>Generated</th>
                        <th>Reference</th>
                    </tr>
                </thead>
                <tbody>
                    {diff.lines.map((line, lineNo) => this.renderLine(line, lineNo + 1))}
                </tbody>
            </table>
            {!hideLegend &&
                <div className="diff-legend">
                    <hr />
                    <div className="diff-legend-items">
                        <span className="line">
                            <span className="square line-1"> </span>
                            <span className="label">Correct</span>
                        </span>
                        <span className="line">
                            <span className="square line-2"> </span>
                            <span className="label">Wrong</span>
                        </span>
                        {/* <span className="line">
                            <span className="square line-unchanged"> </span>
                            <span className="label">Correct</span>
                        </span>
                        <span className="line">
                            <span className="square line-deleted"> </span>
                            <span className="label">Deleted</span>
                        </span>
                        <span className="line">
                            <span className="square line-inserted"> </span>
                            <span className="label">Inserted</span>
                        </span>
                        <span className="line">
                            <span className="square line-modified"> </span>
                            <span className="label">Wrong</span>
                        </span> */}
                    </div>
                </div>
            }
        </>
    }
}