import React from "react";
import { useState } from "react";

export const openCloseState = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    return [
        () => setter(true),
        () => setter(false),
    ]
}

export const useOpenClose = (defaultValue: boolean) => {
    const [value, setValue] = useState(defaultValue);
    return [
        value,
        () => setValue(true),
        () => setValue(false),
    ] as [boolean, () => void, () => void];
}