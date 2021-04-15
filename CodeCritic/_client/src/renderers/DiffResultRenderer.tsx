import React, { useEffect, useState } from 'react';

import { IDiffResultLine } from '../cc-api';

// abandoned I guess?

interface DiffResultRendererProps {

}
export const DiffResultRenderer = (props: DiffResultRendererProps) => {
    const renderLine = (line: IDiffResultLine, lineNo: number) => {
        return <tr key={lineNo}>
            <td className="blob-num" data-line-number={lineNo}>
            </td>
            <td className={`line-${line.type} line blob-code`}>{line.generated}
            </td>
            <td className={`line-${line.type} line blob-code`}>{line.reference}
            </td>
        </tr>
    }

    return (<table className="source-code diff">
        <thead>
            <tr>
                <th></th>
                <th>Generated</th>
                <th>Reference</th>
            </tr>
        </thead>
        <tbody>
            {/* {diff.lines.map((line, lineNo) => renderLine(line, lineNo + 1))} */}
        </tbody>
    </table>)
}