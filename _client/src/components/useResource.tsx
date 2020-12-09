import { useEffect, useState } from 'react';
import { httpClient } from '../init';
export function useResource<T>(url?: string) {
    const [resource, serResource] = useState<T>();
    useEffect(() => {
        if (url) {
            serResource(undefined);
            httpClient.fetch(url, undefined, "auto")
                .then(serResource)
                .catch(e => serResource(undefined));
        }
    }, [url]);
    return resource;
}
