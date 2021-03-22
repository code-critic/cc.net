import { Box, Button, Card, CardContent, Checkbox, createStyles, FormControlLabel, Grid, InputBase, MenuItem, Select, TextField, Theme, Typography, withStyles } from '@material-ui/core';
import React from 'react';

export type ValueType = "string" | "int" | "double" | "boolean" | "datetime" | "enum"
    | "array" | "object" | "model" | "fill" | "section";


export interface ISchemeType {
    type: ValueType;
    required: boolean;
    complex: boolean;
    desc?: string;
    default?: any;

    render(name: string, value: any, onChange: (value) => void, model: SchemaType): JSX.Element;
    xs: boolean | "auto" | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | undefined;
    width?: number;
}


export interface StringType extends ISchemeType { }

export interface IntType extends ISchemeType {
    min?: number;
    max?: number;
    step?: number
}
export interface DoubleType extends IntType { }
export interface BooleanType extends IntType { }

export interface EnumType extends ISchemeType {
    values: any[];
}

export interface ArrayType extends ISchemeType { subtype: SchemaType }
export interface ObjectType extends ISchemeType { subtype: ModelType }
export interface DateTime extends ISchemeType { }






const BootstrapInput = withStyles((theme: Theme) =>
    createStyles({
        input: {
            borderRadius: 4,
            position: 'relative',
            borderColor: 'rgba(0, 0, 0, 0.23)',
            backgroundColor: "#ffffff",
            border: '1px solid #ced4da',
            fontSize: 16,
            padding: '10px 26px 10px 12px',
            transition: theme.transitions.create(['border-color']),
            // Use the system font instead of the default Roboto font.
            fontFamily: [
                '-apple-system',
                'BlinkMacSystemFont',
                '"Segoe UI"',
                'Roboto',
                '"Helvetica Neue"',
                'Arial',
                'sans-serif',
                '"Apple Color Emoji"',
                '"Segoe UI Emoji"',
                '"Segoe UI Symbol"',
            ].join(','),
            '&:focus': {
                borderRadius: 4,
                outline: "-webkit-focus-ring-color auto 1px",
                outlineColor: "#3f51b5",
                borderColor: '#3f51b5',
            },
            '&:hover': {
                borderRadius: 4,
                borderColor: '#000000',
            },
        },
    }),
)(InputBase);


const localName = (name: string) => {
    return name.split(".").reverse()[0];
}

const defProps = {
    variant: "outlined",
    size: "small",
    fullWidth: true,
} as any;

const DefaultRenderer = (name: string, value: any, onChange: (value) => void, model: SchemaType) =>
    <TextField {...defProps} type="text" placeholder={name} value={value || ""} onChange={e => onChange(e.target.value)} />

const NumberRenderer = (name: string, value: any, onChange: (value) => void, model: SchemaType) =>
    <TextField {...defProps} type="number" InputProps={{
        inputProps: {
            min: (model as IntType).min,
            max: (model as IntType).max,
            step: (model as IntType).step,
        }
    }} placeholder={name} value={value || ""} onChange={e => onChange(e.target.value)} />

const BooleanRenderer = (name: string, value: any, onChange: (value) => void, model: SchemaType) => {
    return <FormControlLabel label={name} control={
        <Checkbox checked={value || ""} onChange={e => onChange(e.target.checked)} />
    } />
}

const EnumRenderer = (name: string, value: any, onChange: (value) => void, model: SchemaType) =>
    <Select variant="outlined" className="select-small" fullWidth value={value}
        onChange={e => onChange(e.target.value === "" ? undefined : e.target.value)}
        input={<BootstrapInput />}
    >
        <MenuItem value=""></MenuItem >
        {(model as EnumType).values.map((i, j) => <MenuItem key={j} value={i}>{i}</MenuItem >)}
    </Select>

const GetDateFormat = (date: Date) => {
    const fmt = date.toLocaleString("cs-CZ", { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) as any;
    const items = fmt.replaceAll('.', '').replaceAll(':', ' ').split(' ');
    const [d, m, y, H, M] = items;
    // format 2020-12-16T23:00
    return `${y}-${m}-${d}T${H}:${M}:00`;
}

const DatetimeRenderer = (name: string, value: any, onChange: (value) => void, model: SchemaType) => {
    const dateValue = typeof (value) === "number" || typeof (value) === "string"
        ? GetDateFormat(new Date(value as any))
        : "";

    const onDeferChange = (value: string) => {
        if (value != undefined) {
            value = value.replace("T", " ") + ":00";
        }
        onChange(value);
    }
    return <TextField {...defProps} type="datetime-local" placeholder={name} value={dateValue} onChange={e => onDeferChange(e.target.value)} />
}

const FillRenderer = (name: string, value: any, onChange: (value) => void, model: SchemaType) =>
    <></>

const SectionRenderer = (name: string, value: any, onChange: (value) => void, model: SchemaType) =>
    <Typography style={{ marginTop: 20 }} variant="h4" component="h4">
        {model.desc}
    </Typography>


export type SchemaType = StringType
    | IntType
    | DoubleType
    | BooleanType
    | EnumType
    | ArrayType
    | ObjectType
    | DateTime;

type ModelType = {
    [key: string]: SchemaType
}


const def = {
    complex: false,
    required: true,
    render: DefaultRenderer,
    xs: undefined,
    width: undefined,
}

export class Schema {

    static FillType() {
        return { type: "fill", ...def, render: FillRenderer } as SchemaType;
    };

    static SectionType(label: string) {
        return { type: "section", ...def, render: SectionRenderer, desc: label } as SchemaType;
    };

    static StringType(props?: Partial<StringType>) {
        return { type: "string", ...def, ...props } as StringType;
    };

    static IntType(props?: Partial<IntType>) {
        return { type: "int", ...def, render: NumberRenderer, ...props } as IntType;
    };

    static DoubleType(props?: Partial<DoubleType>) {
        return { type: "double", ...def, min: 1.0, max: 100.0, step: 1.0, render: NumberRenderer, ...props } as DoubleType;
    };

    static BooleanType(props?: Partial<BooleanType>) {
        return { type: "boolean", ...def, render: BooleanRenderer, ...props } as BooleanType;
    };

    static DateTime(props?: Partial<DateTime>) {
        return { type: "datetime", ...def, render: DatetimeRenderer, ...props } as DateTime;
    };

    static EnumType(props?: Partial<EnumType>) {
        return { type: "enum", ...def, values: [], render: EnumRenderer, ...props } as EnumType;
    };

    static ArrayType(props: Partial<SchemaType>, complex = true, required = true) {
        return { type: "array", ...def, complex: complex, required: required, subtype: props } as ArrayType;
    };

    static ObjectType(props?: Partial<ModelType>, complex = true, required = true) {
        return { type: "object", ...def, complex: complex, required: required, subtype: props } as ObjectType;
    };
}


interface GetEditorProps {
    name: string;
    model: SchemaType;
    value: any;
    onChange: (value) => void;
}

interface ClearItemProps {
    name: string;
    onClick?: () => void;
}

const ClearItem = (props: ClearItemProps) => {
    const { name, onClick } = props;
    return <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box style={{ color: "#a5a5a5", fontSize: 12, minWidth: 32, fontVariantCaps: "small-caps" }} className="MuiButton-text MuiButton-textSizeSmall">
            {name}
        </Box>
        {onClick && <Button size="small" style={{ minWidth: 32 }} onClick={onClick}>
            {"×"}
        </Button>}

    </Box>
}

export const GetEditor = (props: GetEditorProps) => {
    const { name, model, value, onChange } = props;
    const lname = localName(name);
    const deleteValue = () => {
        onChange(undefined);
    }

    const onDeferChange = (value) => {
        if (value !== undefined) {
            if (model.type === "int") {
                value = Math.round(Number(value));
            }
            if (model.type === "double") {
                value = Number(value);
            }
        }
        onChange(value);
    }

    return (
        <Box display="flex" flexDirection="column" gridRowGap={5} style={{ paddingRight: 16, borderRight: "1px solid #DDD"}}>
            <ClearItem name={lname} onClick={deleteValue} />
            <Box display="flex" alignItems="center">
                {model.render(lname, value, onDeferChange, model)}
            </Box>
        </Box>
    )
}

interface ObjectEditorProps {
    model: ObjectType;
    object: any;
    onChange: (value) => void;
    name?: string;
    root?: boolean;
}

interface ArrayEditorProps {
    name: string;
    model: ArrayType;
    object: any;
    onChange: (value) => void;
}

const filterEmptyItems = (items: any[], complex: boolean = false) => {
    return complex
        ? items.filter(i => i !== undefined && Object.values(i).some(j => j != undefined))
        : items.filter(i => i !== undefined);
}

export const ArrayEditor = (props: ArrayEditorProps) => {
    const { name, model, onChange, object } = props;
    const arraySubModel = model.subtype;
    const values = filterEmptyItems([...(object || [])], arraySubModel.complex);

    const editors = [...values, arraySubModel.complex ? {} : ""].map((i, j) => {
        const onArrayChange = (value) => {
            const newArr = [...values];
            newArr[j] = value;
            onChange(newArr.filter(k => k !== undefined));
        }
        const key = `${name}[${j}]`;
        if (arraySubModel.complex) {
            return (
                <Grid item container xs={12}>
                    <Grid item xs={1}>
                        <ClearItem name={key} onClick={() => onArrayChange(undefined)} />
                    </Grid>
                    <Grid item xs={11}>
                        <ObjectEditor key={key} name={key} model={arraySubModel as ObjectType} object={i || {}} onChange={onArrayChange} />
                    </Grid>
                </Grid>
            )
        }
        return (
            <Grid item>
                <GetEditor key={key} name={key} model={arraySubModel} value={i} onChange={onArrayChange} />
            </Grid >
        )
    });

    return (
        <Grid container spacing={2}>
            {editors}
        </Grid>
    )
}

export const ObjectEditor = (props: ObjectEditorProps) => {
    const { model, onChange, object, name, root } = props;

    const editors = Object.entries(model.subtype)
        .map((i, j) => {
            const [lname, lmodel] = i;
            const lvalue = object[lname];
            const key = name ? `${name}.${lname}` : lname;

            if (lmodel.type === "fill") {
                return (
                    <Grid item xs={12} style={{ padding: 0 }}></Grid>
                )
            }

            if (lmodel.type === "section") {
                return (
                    <Grid item xs={12}>
                        {lmodel.render(lname, "", null as any, lmodel)}
                    </Grid>
                )
            }

            const onLocalChange = (value) => {
                const newData = { ...object };
                newData[lname] = value;
                onChange(newData);
            }

            if (lmodel.complex === true) {
                if (lmodel.type === "array") {
                    return (
                        <Grid item container xs={12}>
                            <ArrayEditor key={key} name={key} object={lvalue} model={lmodel as ArrayType} onChange={onLocalChange} />
                        </Grid>
                    )

                } else {
                    return (
                        <Grid item container xs={12}>
                            <Grid item xs={1}>
                                <ClearItem name={key} />
                            </Grid>
                            <Grid item xs={11}>
                                <ObjectEditor key={key} name={key} model={lmodel as ObjectType} object={object[lname] || {}} onChange={onLocalChange} />
                            </Grid>
                        </Grid>
                    )
                }
            } else {
                return (
                    <Grid item style={{ maxWidth: lmodel.width }} xs={lmodel.xs}>
                        <GetEditor key={key} name={key} model={lmodel as SchemaType} value={lvalue} onChange={onLocalChange} />
                    </Grid>
                )
            }
        });

    return (
        <>
            {!root && <Grid container spacing={2}>
                {editors}
            </Grid>}

            {root && <Card>
                <CardContent>
                    <Grid container spacing={2}>
                        {editors}
                    </Grid>
                </CardContent>
            </Card>}
        </>
    )
}


/*export const ConfigYamlSchema = () => Schema.ObjectType({
    foobar: Schema.SectionType("Main Props"),
    id: Schema.StringType({ xs: 3 }),
    name: Schema.StringType({ xs: 3 }),
    timeout: Schema.DoubleType({ width: 120 }),
    unittest: Schema.BooleanType({ xs: 2 }),
    libname: Schema.StringType({ xs: 2 }),

    datesSection: Schema.SectionType("Dates & deadlines"),
    since: Schema.DateTime({ xs: 3 }),
    avail: Schema.DateTime({ xs: 3 }),
    deadline: Schema.DateTime({ xs: 3 }),

    assetsSection: Schema.SectionType("Assets"),
    assets: Schema.ArrayType(Schema.StringType({ xs: 3 })),

    exportsSection: Schema.SectionType("Exports"),
    export: Schema.ArrayType(Schema.StringType({ xs: 3 })),

    referenceSection: Schema.SectionType("Reference solution"),
    reference: Schema.ObjectType({
        name: Schema.StringType({ xs: 3 }),
        lang: Schema.EnumType({ xs: 2, values: ["MATLAB", "PY-367", "C", "CPP", "JAVA", "CS"] }),
        hidden: Schema.BooleanType({ xs: 2 }),
    }),


    testsSection: Schema.SectionType("Tests"),
    tests: Schema.ArrayType(
        Schema.ObjectType({
            id: Schema.StringType({ xs: 2 }),
            test: Schema.StringType({ xs: 2 }),
            size: Schema.IntType({ width: 120 }),
            random: Schema.IntType({ width: 120 }),
            timeout: Schema.DoubleType({ width: 120 }),
        })
    ),
});*/