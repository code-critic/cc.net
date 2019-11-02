export function transpose<D>(matrix: any[][]): any[][] {
    return matrix.reduce((prev, next) => next.map((_item, i) => (prev[i] || []).concat(next[i])), []);
}
