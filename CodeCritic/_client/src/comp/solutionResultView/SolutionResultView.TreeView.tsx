import * as React from 'react';
import { ICcData, ISimpleFile } from '../../cc-api';
import { TreeItem, TreeView } from '@material-ui/lab';
import { useState } from 'react';
import { useUser } from "../../hooks/useUser";
import { normalizePath } from '../../utils/utils';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import RateReviewIcon from '@material-ui/icons/RateReview';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';

interface SolutionResultViewTreeViewRootProps {
    result: ICcData;

    onChange(item: ISimpleFile): void;
}


export const SolutionResultViewTreeViewRoot = (props: SolutionResultViewTreeViewRootProps) => {
    const { result, onChange } = props;
    const { isRoot } = useUser();
    const [selected, setSelected] = useState<string>(result.solutions[0]?.filename ?? "");

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

    const handleSelect = (_event: React.ChangeEvent<{}>, nodeId: string) => {
        setSelected(nodeId);
        const file = findFile(allFiles, nodeId);

        if (file && !file.isDir) {
            onChange(file);
        }
    };

    const nodeIds = [
        ...allFiles.map(i => i.relPath),
        ...allFiles.flatMap(i => i.files).map(i => i.relPath),
        ...allFiles.flatMap(i => i.files).flatMap(i => i.files).map(i => i.relPath),
    ];

    return (<TreeView selected={selected} onNodeSelect={handleSelect} defaultExpanded={nodeIds}>
        <SolutionResultViewTreeView result={result} files={allFiles} />
    </TreeView>)
}


interface SolutionResultViewTreeViewProps {
    files: ISimpleFile[];
    result: ICcData;
}

const SolutionResultViewTreeView = React.forwardRef((props: SolutionResultViewTreeViewProps, _ref) => {
    const { files, result } = props;

    return <>
        {files.map((i, _j) => {
            const hasComment = result.comments
                ?.find(k => normalizePath(k.filename) === normalizePath(i.relPath))
                != null;

            const expandCls = i.isDir
                ? <ChevronRightIcon />
                : <InsertDriveFileIcon />;

            const collapseCls = i.isDir
                ? <ExpandMoreIcon />
                : <InsertDriveFileIcon />;

            return <TreeItem key={i.filename}
                nodeId={i.relPath}
                expandIcon={expandCls}
                collapseIcon={collapseCls}
                label={<>
                    {hasComment && <em>{i.filename}&nbsp;<RateReviewIcon fontSize="small" className="file-has-comment" /></em>}
                    {!hasComment && <>{i.filename}</>}
                </>}>
                <SolutionResultViewTreeView result={result} files={i.files} />
            </TreeItem>
        })}
    </>
});