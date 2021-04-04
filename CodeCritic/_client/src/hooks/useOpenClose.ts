import { useState } from "react";


export function useOpenClose(defaultValue: boolean = false) {
    const [value, setValue] = useState(defaultValue);
    return [
        value,
        () => setValue(true),
        () => setValue(false),
    ] as [boolean, () => void, () => void];

    // const [ open, setOpen, setClose] = useOpenClose();
}
