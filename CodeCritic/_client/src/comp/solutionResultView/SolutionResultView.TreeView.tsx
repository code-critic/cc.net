import * as React from 'react';
import CodeIcon from '@material-ui/icons/Code';
import FolderIcon from '@material-ui/icons/Folder';
import FolderOpenIcon from '@material-ui/icons/FolderOpen';
import { ICcData, ISimpleFile } from '../../models/DataModel';
import { TreeItem, TreeView } from '@material-ui/lab';
import { useState } from 'react';
import { useUser } from "../../hooks/useUser";


interface SolutionResultViewTreeViewRootProps {
    result: ICcData;

    onChange(item: ISimpleFile): void;
}

export const SolutionResultViewTreeViewRoot = (props: SolutionResultViewTreeViewRootProps) => {
    const { result, onChange } = props;
    const { isRoot } = useUser();
    const [ selected, setSelected ] = useState<string>(result.solutions[0]?.filename ?? "");

    const solutionSimpleFiles: ISimpleFile[] = result.solutions
        .filter(i => isRoot || !i.hidden)
        .map(i => {
            return {
                filename: i.filename,
                isDir: false,
                files: [],
                content: i.content,
                relPath: `/${i.filename}`,
                rawPath: null,
            }
        });
    const allFiles = [
        ...solutionSimpleFiles,
        ...result.files
    ];

    const findFile = (files: ISimpleFile[], relPath: string) => {
        for (const f of files) {
            if (f.relPath == relPath) {
                return f;
            } else {
                const ff = findFile(f.files, relPath);
                if (ff) {
                    return ff;
                }
            }
        }
        return undefined;
    }

    const handleSelect = (event: React.ChangeEvent<{}>, nodeId: string) => {
        setSelected(nodeId);
        const file = findFile(allFiles, nodeId);

        if (file && !file.isDir) {
            onChange(file);
        }
    };

    return (<TreeView selected={selected} onNodeSelect={handleSelect}>
        <SolutionResultViewTreeView files={allFiles}/>
    </TreeView>)
}


interface SolutionResultViewTreeViewProps {
    files: ISimpleFile[];
}

export const SolutionResultViewTreeView = React.forwardRef((props: SolutionResultViewTreeViewProps, ref) => {
    const { files, ...rest } = props;

    return <>
        {files.map((i, j) => <TreeItem key={i.filename}
                                       nodeId={i.relPath}
                                       expandIcon={i.isDir ? <FolderIcon/> : i.filename.startsWith("/") ? null :
                                           <CodeIcon/>}
                                       collapseIcon={i.isDir ? <FolderOpenIcon/> : i.filename.startsWith("/") ? null :
                                           <CodeIcon/>}
                                       label={i.filename || "Solution files"}>
            <SolutionResultViewTreeView files={i.files}/>
        </TreeItem>)}
    </>
});