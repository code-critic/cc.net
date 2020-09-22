
export const colorPallete = [
    '#3498db',
    '#2980b9',
    '#8e44ad',
    '#9b59b6',
    '#e74c3c',
    '#c0392b',
    '#ba4a00',
    '#ca6f1e',
    '#d68910',
    '#d4ac0d',
    '#229954',
    '#148f77',
    '#cddc39',
    '#8bc34a',
    '#0288d1',
    '#2196f3',
    '#e91e63',
    '#f44336',
    '#00CC00',
    '#66CC33',
    '#663300',
    '#CC3333',
    '#CC9900',
    '#CCFF33',
    '#99FFCC',
    '#999999',
    '#FF99FF',
    '#CCFFFF',
    '#00CC00',
    '#FF9933',
    '#CC3366',
    '#990000',
    '#00FF33',
    '#006666',
    '#330099',
    '#4a148c',
    '#004d40',
    '#546e7a',
    '#424242',
    '#1b5e20',
    '#ff6f00',
];

const hashValue = (value: any) => {
    const str = new String(value);
    let hash = 0;
    for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash;
    }
    return Math.abs(hash);
}

export const randomColor = (value: any) => {
    const hash = hashValue(value);
    return colorPallete[hash  % colorPallete.length];
}

type propType = 'color' | 'backgroundColor';
export const randomColorCss = (value: any, prop: propType ="backgroundColor") => {
    let result = {};
    result[prop] = randomColor(value);
    return result;
}