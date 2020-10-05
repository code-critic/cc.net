import React, { Suspense, useEffect } from "react";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import Button from "@material-ui/core/Button";
import Link from '@material-ui/core/Link';
import { Typography } from "@material-ui/core";

interface ShowAssetsProps {
    assets: string[];
    urlPrefix: string;
}

export const ShowAssets = (props: ShowAssetsProps) => {
    const { assets, urlPrefix } = props;

    return (<>
        <div className="my-">
            <Typography>Available assets:</Typography>
            <ButtonGroup>
                {assets.map(i => {
                    // return <Link href={`${urlPrefix}/${i}`} target="_blank" component="button">{i}</Link>
                    return <Button key={i} href={`${urlPrefix}/${i}`}>
                        {i}
                    </Button>
                })}
            </ButtonGroup>
        </div>
    </>)
}
