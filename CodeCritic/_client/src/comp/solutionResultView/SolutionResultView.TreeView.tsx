import React, { useEffect, useState } from 'react';

import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import RateReviewIcon from '@mui/icons-material/RateReview';
import { TreeItem, TreeView } from '@mui/lab';

import { ICcData, ISimpleFile } from '../../cc-api';
import { useUser } from '../../hooks/useUser';
import { normalizePath } from '../../utils/utils';

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
        {allFiles.length > 0 && <SolutionResultViewTreeView result={result} files={allFiles} />}
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
                icon={expandCls}
                expandIcon={expandCls}
                collapseIcon={collapseCls}
                label={<>
                    {hasComment && <em>{i.filename}&nbsp;<RateReviewIcon fontSize="small" className="file-has-comment" /></em>}
                    {!hasComment && <>{i.filename}</>}
                </>}>
                {i.files.length > 0 && <SolutionResultViewTreeView result={result} files={i.files} />}
            </TreeItem>
        })}
    </>
});