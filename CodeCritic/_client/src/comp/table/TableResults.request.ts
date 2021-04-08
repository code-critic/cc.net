import { ITableRequest, ITableRequestFilter, ITableRequestSort } from '../../cc-api';
import { TableModel } from './TableResults';

export const createTableRequest = (model: TableModel, course?: string, year?: string, problem?: string) => {
    const { pageModel, filterModel, sortModel } = model ?? {};
    const { page = 0, pageSize = 20 } = pageModel ?? {};
    const filtered = (filterModel?.items ?? [])
        .map(i => {
            return {
                id: i.columnField, value: i.value
            } as ITableRequestFilter
        });

    const sorted = (sortModel?.length ? sortModel : [])
        .map(i => {
            return {
                id: i.field, desc: i.sort === "desc"
            } as ITableRequestSort
        });

    
    if (course && !filtered.find(i => i.id === "course")) {
        filtered.push({ id: "course", value: course })
    }
    
    if (year && !filtered.find(i => i.id === "year")) {
        filtered.push({ id: "year", value: year })
    }

    if (problem && !filtered.find(i => i.id === "problem")) {
        filtered.push({ id: "problem", value: problem })
    }

    const response: ITableRequest = {
        page, pageSize, filtered, sorted
    }

    return response;
}