import { useEffect, useState } from 'react';

export const useCtrl = () => {
    const [ctrl, setCtrl] = useState(0);

    const update = (value: boolean) => {
        const newValue = value ? Math.random() + 1 : 0;
        setCtrl(newValue);
    }

    useEffect(() => {
        document.addEventListener("keydown", (e) => {
            if (e.key == "Control") {
                update(true);
            }
        });
        document.addEventListener("keyup", (e) => {
            if (e.key == "Control") {
                update(false);
            }
        });
    }, []);
    
    return { ctrl: ctrl > 0 };
}