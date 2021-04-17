import React, { useEffect, useState } from 'react';

export const useTextSelection = () => {
    const [selectedText, setSelectedText] = useState("");
    const variableRegex = new RegExp(/^[a-z0-9_]+$/gi);

    useEffect(() => {
        document.addEventListener("mousedown", checkSelection);
        document.addEventListener("mouseup", checkSelection);

        return () => {
            document.removeEventListener("mousedown", checkSelection);
            document.removeEventListener("mouseup", checkSelection);
        }
    }, [ ]);

    const checkSelection = () => {
        const selection = document.getSelection();
        
        const source = selection?.anchorNode?.parentElement;
        if (!source) {
            return;
        }
        const newSelection = selection.toString();
        const updateSelection = newSelection === ""
            || (variableRegex.test(newSelection)
                && newSelection.length >= 2
                && [source, 
                    source.parentElement,
                    source.parentElement?.parentElement,
                    source.parentElement?.parentElement?.parentElement].some(i => i?.classList.contains("selectable")))

        if (newSelection !== selectedText) {
            if (updateSelection) {
                setSelectedText(newSelection);
            }
        }
    }

    return selectedText;
}