import React, { Suspense, useEffect } from "react";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import Button from "@material-ui/core/Button";
import Link from '@material-ui/core/Link';
import { Typography } from "@material-ui/core";
import ViewListIcon from '@material-ui/icons/ViewList';
import ImageIcon from '@material-ui/icons/Image';
import AudiotrackIcon from '@material-ui/icons/Audiotrack';
interface ShowAssetsProps {
    assets: string[];
    urlPrefix: string;
}

const GetIcon = (filename: string) => {
    const ext = filename.toLowerCase().split(".").reverse()[0];
    switch(ext) {
        case "xls":
        case "mat":
            return <ViewListIcon />
        case "jpg":
        case "jpeg":
        case "png":
        case "gif":
            return <ImageIcon />
        case "wav":
            return <AudiotrackIcon />
    }
    return undefined;
}

const GetExtraClass = (filename: string) => {
    const ext = filename.toLowerCase().split(".").reverse()[0];
    switch(ext) {
        case "xls":
        case "mat":
            return "MuiButton-outlinedPrimary green"
        case "jpg":
        case "jpeg":
        case "png":
        case "gif":
            return ""
        case "wav":
            return "MuiButton-outlinedPrimary"
    }
    return "";
}

export const ShowAssets = (props: ShowAssetsProps) => {
    const { assets, urlPrefix } = props;

    return (<>
        <div>
            <Typography>Available assets:</Typography>
            <div className="button-drig">
                {assets.sort().map(i => {
                    const cls = `small ${GetExtraClass(i)}`;
                    return <Button startIcon={GetIcon(i)} key={i} href={`${urlPrefix}/${i}`} variant="outlined" size="small" className={cls}>
                        {i}
                    </Button>
                })}
            </div>
            <hr />
        </div>
    </>)
}
