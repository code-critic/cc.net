import moment from 'moment';
import React from 'react';
import Spreadsheet from 'react-spreadsheet';
import XLSX from 'xlsx';
import { IGradeDto } from '../models/DataModel';
import { ProcessStatusStatic } from '../models/Enums';
import { DropDownMenu } from '../components/DropDownMenu';


interface DefaultCellValue {
    value: string | number | boolean | null,
}
type Matrix<T> = Array<Array<T | typeof undefined>>;
interface GenerateSheetProps {
    stats: IGradeDto[];
    name: string;
}

let exportData: Matrix<DefaultCellValue> = [];
export const GenerateSheet = (props: GenerateSheetProps) => {
    const { stats, name } = props;
    const sorted = stats.sort((a, b) => a.user.id.localeCompare(b.user.id));
    const header: DefaultCellValue[] = [{ value: "Date" }, { value: "User" }, { value: "Points" }, { value: "Status" }, { value: "Comment" }];
    const data: Matrix<DefaultCellValue> = [
        header,
        ...(sorted.map(i => {
            return [
                { value: moment(i.result.id.creationTime).format("YYYY/MM/DD hh:mm:ss") },
                { value: i.user.id },
                { value: i.result.points },
                { value: ProcessStatusStatic.All.find(j => j.value == i.result.result.status)?.name ?? null },
                { value: i.result.gradeComment },
            ];
        })),
        []
    ];

    exportData = data;
    const handleChange = (newData: Matrix<DefaultCellValue>) => {
        exportData = newData;
    }

    const download = (bookType: any) => {
        // const cols = exportData[0].map((i, j) => { return { name: i?.value, key: j } } );
        // const aoa: any = { cols: cols, data: data };
        // const table = document.getElementsByClassName("Spreadsheet__table")[0];
        // const wb = XLSX.utils.table_to_book(table, { sheetRows: 5 });

        const data = exportData.slice(1).map(i => i.map(j => j?.value));
        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, name);
        XLSX.writeFile(wb, `${name}.${bookType}`, { bookType: bookType });
    }

    // 'xlsx' | 'xlsm' | 'xlsb' | 'xls' | 'xla' | 'biff8' | 'biff5' | 'biff2' | 'xlml' |
    // 'ods' | 'fods' | 'csv' | 'txt' | 'sylk' | 'html' | 'dif' | 'rtf' | 'prn' | 'eth';
    const options = ["xlsx", "xls", "ods", "html", "csv", "txt"];

    return <div className="data-export">
            <div>
                <DropDownMenu title="Download as..."
                    getLabel={i => i}
                    onChange={i => download(i)}
                    options={options} />
            </div>
            <div>
                <Spreadsheet onChange={handleChange} data={data} />
            </div>
        </div>
}