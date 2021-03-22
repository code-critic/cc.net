import { Button, Tooltip } from "@material-ui/core";
import React from "react";

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