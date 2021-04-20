import React, { useEffect, useState } from 'react';
import { IDiffPiece, ISideBySideDiff } from "../cc-api"
import { languages } from '../static/languages';
import { highlightLine } from '../text/highlight';

interface RenderDiffTableProps {
    item: ISideBySideDiff;
    syntax?: string;
}
export const RenderDiffTable = (props: RenderDiffTableProps) => {
    const { item, syntax } = props;
    const language = languages.find(i => i.id === syntax);

    const renderLine = language
        ? (p: IDiffPiece) => <pre dangerouslySetInnerHTML={{__html: highlightLine((p.text ?? "") + '\u00A0', language)}}></pre>
        : (p: IDiffPiece) => <pre>{p.text}{'\u00A0'}</pre>

    const ids = new Array(item.diff.newText.lines.length).fill(0).map((i, j) => j);
    return <table className="side-by-side-diff">
        <thead>
            <tr>
                <th style={{ width: "50%" }}>{item.a}</th>
                <th></th>
                <th style={{ width: "50%" }}>{item.b}</th>
            </tr>
        </thead>
        <tbody>
            {ids.map(i => {
                const a = item.diff.oldText.lines[i];
                const b = item.diff.newText.lines[i];
                const type = a.text == b.text ? 0 : a.type;


                return <tr key={i}>
                    <td className={`type-${type}`}>{renderLine(a)}</td>
                    <td></td>
                    <td className={`type-${type}`}>{renderLine(b)}</td>
                </tr>
            })}
        </tbody>
    </table>
}