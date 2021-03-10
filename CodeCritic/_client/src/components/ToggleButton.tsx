import React from "react";
import { Dialog, DialogTitle, Box, Grid, Button, DialogContent, ButtonGroup, ButtonTypeMap, ExtendButtonBase, Tooltip } from "@material-ui/core";

export const ToggleButton = (props) => {
    const [selected, setSelected] = React.useState(props.selected ? true : false);
    const { className, onClick, title, ...rest } = props;

    return <Tooltip title={title}>
        <Button
            onClick={(e) => {
                setSelected(!selected);
                if (onClick) {
                    onClick(e);
                }
            }}
            className={`${className ? className : ""} ${selected ? "selected" : ""} MuiToggleButton-root`}
            {...rest} />
    </Tooltip>
}