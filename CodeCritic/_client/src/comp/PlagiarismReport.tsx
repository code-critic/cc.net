import React, { useEffect, useState } from 'react';

import { Button, Container, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';
import { DataGrid, GridColDef } from '@material-ui/data-grid';
import PolicyIcon from '@material-ui/icons/Policy';

import { CodeCritic } from '../api';
import { IPlagResult, ISideBySideDiff } from '../cc-api';
import { SimpleLoader } from '../components/SimpleLoader';
import { ProblemPicker, ProblemPickerExportProps } from './ProblemPicker';
import { RenderDiffTable } from '../renderers/RenderDiffTable';

export const PlagiarismReport = () => {
    return <div>
        <ProblemPicker
            baseUrl="/plagiarism"
            home={<><PolicyIcon />Plagiarism</>}
            component={PlagiarismReportImpl}
            withBreadcrumbs
            whereUserIsTeacher
        />
    </div>
}

/*
 public enum ChangeType
    {
        Unchanged,
        Deleted,
        Inserted,
        Imaginary,
        Modified
    }
*/

interface PlagiarismReportImplProps extends ProblemPickerExportProps { }
const PlagiarismReportImpl = (props: PlagiarismReportImplProps) => {
    const { course, problem } = props;
    const [items, setItems] = useState<IPlagResult[]>();
    const [pair, setPair] = useState<[string, string]>();
    const [selectedDiff, setSelectedDiff] = useState<IPlagResult>();

    const onClose = () => {
        setSelectedDiff(undefined);
        setPair(undefined);
    }

    useEffect(() => {
        (async () => {
            const response = await CodeCritic.api.plagAllDetail(problem.course, problem.year, problem.id);
            setItems(response.data.map((i, id) => {
                return { ...i, id }
            }));
        })()
    }, []);

    useEffect(() => {
        (async () => {
            if (pair) {
                const response = await CodeCritic.api.plagTwoDetail(pair[0], pair[1]);
                setSelectedDiff(response.data);
            }
        })()
    }, [pair?.[0], pair?.[1]]);


    if (!items) {
        return <SimpleLoader />
    }

    const columns: GridColDef[] = [
        { field: 'id', hide: true },
        { field: 'aName', headerName: 'User A', flex: 2 },
        { field: 'bName', headerName: 'User B', flex: 2 },
        { field: 'totalLines', headerName: 'Total lines', flex: 1 },
        { field: 'equalLines', headerName: 'Equal lines', flex: 1 },
        {
            field: '%', headerName: '%', flex: 1,
            valueGetter: i => (100 * i.row.equalLines / Math.max(1, i.row.totalLines)),
            valueFormatter: i => (i.value as number).toFixed(0)
        },
    ];

    return <Container>
        <div style={{ height: 600, width: '100%' }}>
            <DataGrid columns={columns} rows={items} density="compact" onRowClick={i => setPair([i.row.aId, i.row.bId])} />
        </div>


        {selectedDiff && <Dialog open onClose={onClose} fullScreen>
            <DialogTitle>{selectedDiff.aName} vs {selectedDiff.bName}</DialogTitle>
            <DialogContent>
                {selectedDiff.diffs.map((k, l) => <div key={l}>
                    <RenderDiffTable syntax={selectedDiff.language} item={k} />
                </div>)}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>}
    </Container>
}