import React from "react";

export const openCloseState = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    return [
        () => setter(true),
        () => setter(false),
    ]
}