/**
 * @description
 * Takes an Array<V>, and a grouping function,
 * and returns a Map of the array grouped by the grouping function.
 *
 * @param list An array of type V.
 * @param keyGetter A Function that takes the the Array type V as an input, and returns a value of type K.
 *                  K is generally intended to be a property key of V.
 *
 * @returns Map of the array grouped by the grouping function.
 */
export function groupBy<K, V>(list: Array<V>, keyGetter: (input: V) => K): Map<K, Array<V>> {
    const map = new Map<K, Array<V>>();
    list.forEach((item) => {
        const key = keyGetter(item);
        const collection = map.get(key);
        if (!collection) {
            map.set(key, [item]);
        } else {
            collection.push(item);
        }
    });
    return map;
}

interface IObjectId {
    objectId?: string | null;
}

export function nextIndex<T extends IObjectId>(items: T[], selected: string): [boolean, number, T] {
    if (items != null && items.length > 1 && selected != null ) {
        const index = items.findIndex(i => i.objectId == selected);
        if (index !== -1) {
            const next = index + 1;
            if (next < items.length) {
                return [true, next, items[next]];
            }
        }
    }

    return [false, null, null];
}

export function prevIndex<T extends IObjectId>(items: T[], selected: string): [boolean, number, T] {
    if (items != null && items.length > 1 && selected != null ) {
        const index = items.findIndex(i => i.objectId == selected);
        if (index !== -1) {
            const prev = index - 1;
            if (prev >= 0) {
                return [true, prev, items[prev]];
            }
        }
    }

    return [false, null, null];
}


export function randomChoice<T>(arr: T[]): T {
    return arr[Math.floor(arr.length * Math.random())];
}

export function distinctBy<K, V>(list: Array<V>, keyGetter: (input: V) => K): Array<V> {
    return [...groupBy(list, keyGetter).values()].map(v => v[0]);
}