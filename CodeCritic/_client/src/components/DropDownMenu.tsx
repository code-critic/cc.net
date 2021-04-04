import React from 'react';

import { Button, Menu, MenuItem } from '@material-ui/core';

interface DropDownMenuProps<T> {
    title: string | JSX.Element;
    options: T[];
    getLabel?: (item: T) => string | JSX.Element;
    onChange: (item: T) => void;
    getIsDisabled?: (item: T) => boolean;
    buttonProps?: object;
}

export function DropDownMenu<T>(props: DropDownMenuProps<T>) {
    const { title, options, getLabel, onChange, buttonProps, getIsDisabled } = props;
    const extraProps = buttonProps ?? {};
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const isDisabledFunc = getIsDisabled
        ? getIsDisabled
        : () => false;

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = (item: T | null) => {
        setAnchorEl(null);
        if (item != null) {
            onChange(item);
        }
    };

    const defFunc = (t) => t;
    const labelFunc = getLabel ?? defFunc;

    return (
        <>
            <Button aria-controls="dd-menu" aria-haspopup="true" onClick={handleClick} {...extraProps}>
                {title}
            </Button>
            <Menu
                id="dd-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={() => handleClose(null)}>
                {options.map((i, j) => <MenuItem key={j} disabled={isDisabledFunc(i)} onClick={() => handleClose(i)}>
                    {labelFunc(i)}
                </MenuItem>)}
            </Menu>
        </>
    );
}