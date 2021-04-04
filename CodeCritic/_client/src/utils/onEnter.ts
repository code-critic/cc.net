import * as React from 'react';

export const onEnter = (onEnterFunction:() => void) => {
    const handleKeyPress = (e: React.KeyboardEvent<any>) => {
        if (e.key === "Enter") {
            onEnterFunction();
        }
    }
    return handleKeyPress;
}