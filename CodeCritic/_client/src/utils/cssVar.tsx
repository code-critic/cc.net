// https://devicon.dev/

export const cssVar = (key: string, value: any) => {
    const k = {} as any;
    k[`--${key}`] = value;
    return k as any;
};
