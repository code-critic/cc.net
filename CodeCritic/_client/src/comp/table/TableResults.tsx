import React, { useState, useEffect } from 'react';
import { debounce } from 'throttle-debounce';

import { IconButton } from '@material-ui/core';
import {
    DataGrid, FilterModel, GridPageChangeParams, GridRowParams, GridRowsProp, GridSortModel,
    GridSortModelParams,
} from '@material-ui/data-grid';

import { SimpleLoader } from '../../components/SimpleLoader';
import { ICcDataDto, ITableResponse } from '../../cc-api';
import { columns } from './TableResults.columns';
import { TableResultsFilters } from './TableResults.filters';

const FilterIcon = (props) => {
    return <svg className="MuiSvgIcon-root MuiSvgIcon-fontSizeSmall" focusable="false" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4.25 5.61C6.27 8.2 10 13 10 13v6c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-6s3.72-4.8 5.74-7.39c.51-.66.04-1.61-.79-1.61H5.04c-.83 0-1.3.95-.79 1.61z"></path></svg>
}

interface PageModel {
    page: number,
    pageSize: number;
}

export interface TableModel {
    pageModel: PageModel;
    filterModel: FilterModel;
    sortModel: GridSortModel;
    lastChange: "page" | "filter" | "sort";
}

type ClientServerMode = "server" | "client";

interface TableResultsProps {
    isLoading: boolean;
    tableResponse: ITableResponse;
    debounceDuration?: number;
    onChange(model: TableModel): void;
    onSelected(item: ICcDataDto): void;
    mode?: ClientServerMode;
}
export const TableResults = (props: TableResultsProps) => {
    const { tableResponse, onSelected, onChange, isLoading, debounceDuration = 0, mode = "server" } = props;
    const [sortModel, setSortModel] = useState<GridSortModel>([]);
    const [filterModel, setFilterModel] = useState<FilterModel>();
    const [pageModel, setPageModel] = useState<PageModel>({ page: 0, pageSize: 20 });
    const [filtersOpen, setFiltersOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "F3" || (e.ctrlKey && e.key === "f")) {
                e.preventDefault();
                setFiltersOpen(true);
            }
        }

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        }
    }, []);

    if (!tableResponse) {
        return <SimpleLoader title="loading results" />
    }

    const rows: GridRowsProp = tableResponse.data.map((i, id) => {
        return { ...i, id };
    });

    const onChangeDebounce = debounceDuration > 0
        ? debounce(debounceDuration, false, onChange)
        : onChange;


    const handleSortChange = (e: GridSortModelParams) => {
        const sortModel = e.sortModel;
        setSortModel(sortModel);
        onChange({ pageModel, filterModel, sortModel, lastChange: "sort" })
    };

    const handlePageChange = (e: GridPageChangeParams) => {
        const pageModel = { pageSize: e.pageSize, page: e.page };
        setPageModel(pageModel);
        onChange({ pageModel, filterModel, sortModel, lastChange: "page" });
    };


    const closeDialog = () => {
        setFiltersOpen(false)
    }

    const changeFilter = (model: FilterModel) => {
        const filterModel = model;
        setFilterModel(filterModel);
        onChangeDebounce({ pageModel, filterModel, sortModel, lastChange: "filter" });
    }

    const handleRowSelected = (e: GridRowParams) => {
        onSelected(e.row as unknown as ICcDataDto);
    }

    const showFilters = () => {
        setFiltersOpen(true);
    }

    return (<>
        {filtersOpen && <>
            <TableResultsFilters
                columns={columns}
                filterModel={filterModel}
                onChange={changeFilter}
                onClose={closeDialog} />
        </>}
        <div className="data-grid-wrapper">
            <IconButton onClick={showFilters} className="data-grid-filter-btn">
                <FilterIcon />
            </IconButton>
            <DataGrid
                className={`${isLoading ? "is-loading" : ""}`}
                rows={rows}
                columns={columns}
                density={"compact"}
                loading={isLoading}

                onSortModelChange={handleSortChange}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageChange}
                onRowClick={handleRowSelected}

                rowsPerPageOptions={[20, 50, 100]}
                pageSize={pageModel.pageSize}
                page={pageModel.page}
                rowCount={tableResponse.count}
                pagination disableSelectionOnClick
                filterMode={mode}
                filterModel={filterModel}
                sortingMode={mode}
                paginationMode={mode} />
        </div>
    </>)
}