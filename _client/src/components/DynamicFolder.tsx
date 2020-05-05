import React from "react";
import { renderCode } from "../utils/renderers";
import { ICcDataSolution } from "../models/DataModel";
import { httpClient } from "../init";
import { Tabs, Tab } from "@material-ui/core";

interface FetchCacheItem {
    content: any;
    validUntil: Date;
}

export const DynamicFolder = (props: { solution: ICcDataSolution }) => {
    const [files, setFiles] = React.useState([] as any[]);
    const [value, setValue] = React.useState(0);
    const [fetched, setFetched] = React.useState(false);
    const { solution } = props;
    const baseUrl = `browse-dir/${solution.content}/${solution.filename}`;

    const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        setValue(newValue);
    };

    if (!fetched) {
        httpClient
            .fetchWithCache(baseUrl, 5)
            .then(data => {
                setFetched(true);
                setFiles(data);
            });
        return <div>Loading</div>
    }

    if (!files.length) {
        return <div>No files found</div>
    }

    return <div>
        <Tabs
            value={value}
            onChange={handleChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth">
            {files.map((i, j) => <Tab key={j} label={i.filename}></Tab>)}
        </Tabs>

        {files.map((i, j) => {
            return j == value &&
                <div>{renderCode(i.content)}</div>
        })}
    </div>
};