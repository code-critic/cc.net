import React, { useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';


interface DropDownMenuProps<T> {
    title: string;
    options: T[];
    getLabel: (item: T) => string;
    onChange: (item: T) => void;
}
export function DropDownMenu<T> (props: DropDownMenuProps<T>) {
    const { title, options, getLabel, onChange } = props;
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = (item: T) => {
        setAnchorEl(null);
        onChange(item);
    };

    return (
        <div>
            <Button aria-controls="dd-menu" aria-haspopup="true" onClick={handleClick}>
                {title}
            </Button>
            <Menu
                id="dd-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                {options.map((i, j) => <MenuItem key={j} onClick={() => handleClose(i)}>{getLabel(i)}</MenuItem>)}
            </Menu>
        </div>
    );
}