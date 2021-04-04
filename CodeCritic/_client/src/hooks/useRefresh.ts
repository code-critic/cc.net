import { useState } from "react"

export const useRefresh = () => {
    const [counter, setCounter] = useState(0);
    const refresh = () => {
      setCounter(counter +1);
    }

    // const { counter, refresh } = useRefresh();
    return { counter, refresh };
}