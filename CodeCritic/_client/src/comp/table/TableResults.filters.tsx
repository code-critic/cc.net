import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import React, { useState } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    TextField
} from '@mui/material';
import { DropDownMenu } from '../../components/DropDownMenu';
import { GridFilterModel } from '@mui/x-data-grid';
import { GridColDefEx } from './TableResults.columns';
import ClearIcon from '@mui/icons-material/Clear';
import { onEnter } from '../../utils/onEnter';


interface KV {
    value: any;
    human: any;
}
interface TableResultsFiltersProps {
    columns: GridColDefEx[];
    filterModel: GridFilterModel;
    onClose(): void;
    onChange(model: GridFilterModel): void;
}

const fromModel = (model: GridFilterModel) => {
    const map = new Map<string, KV>();
    model.items.forEach(i => {
        map.set(i.columnField, { value: i.value, human: (i as any).human });
    });
    return map;
}

const toModel = (map: Map<string, KV>) => {
    const model: GridFilterModel = {
        items:
            [...map.entries()].map(i => {
                return {
                    columnField: i[0],
                    value: i[1].value,
                    human: i[1].human,
                } as any;
            }).filter(i => i.value !== "" && i.value !== "all")
    };
    return model;
}

export const TableResultsFilters = (props: TableResultsFiltersProps) => {
    const { columns, filterModel, onClose, onChange } = props;
    const [filters, setFilters] = useState<Map<string, KV>>(fromModel(filterModel ?? { items: [] }));

    const finishDialog = () => {
        onChange(toModel(filters));
        onClose();
    }

    const editFilter = (field: string, value: any, human?: string) => {
        filters.set(field, { value, human });
        setFilters(new Map(filters.entries()));
    }

    const removeFilter = (field: string) => {
        editFilter(field, "");
    }

    return (<Dialog open onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
            Edit Filters
        </DialogTitle>
        <DialogContent>
            {columns.map((i, j) => {
                const { field } = i;

                const { value = "", human = "" } = filters.get(field) ?? {};

                return (<div key={j} className="filter-row">
                    <FormControlLabel
                        labelPlacement="start"
                        label={<code style={{ minWidth: 150, display: "block" }}>{field}: &nbsp;</code>}
                        onKeyPress={onEnter(finishDialog)}
                        control={<>
                            {i.options &&
                                <>
                                    <DropDownMenu
                                        title={<>{human || "Choose an option"}&nbsp;<ArrowDropDownIcon /></>}
                                        getLabel={i => i.name}
                                        onChange={i => editFilter(field, i.value, i.name)}
                                        options={i.options}
                                    />
                                </>
                            }
                            {i.strict !== true && <TextField
                                variant="filled"
                                autoFocus={i.field === "users"}
                                type={i.type ?? "text"}
                                value={value}
                                onChange={e => editFilter(field, e.target.value)} />
                            }
                        </>}
                    />
                    {value &&
                        <Button className="clearBtn" size="small" onClick={() => removeFilter(field)}>
                            <ClearIcon />
                        </Button>}
                </div>)
            })}
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose} color="primary">Cancel</Button>
            <Button onClick={finishDialog} color="secondary">Apply</Button>
        </DialogActions>
    </Dialog>)
}