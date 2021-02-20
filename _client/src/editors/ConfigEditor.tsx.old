import React, { useState, useEffect } from 'react'
import { ArrayEditor, SchemaTypes } from 'object-editor-react';
import { useResource } from '../components/useResource';
import { SimpleLoader } from '../components/SimpleLoader';
import yaml from 'js-yaml'


const required = { required: true };
const ArrayOfString = () => SchemaTypes.arrayOf({
    type: SchemaTypes.string()
});

const schema = {
    id: SchemaTypes.string(required),
    name: SchemaTypes.string(required),

    avail: SchemaTypes.date(required),
    since: SchemaTypes.date(required),
    deadline: SchemaTypes.date(required),

    timeout: SchemaTypes.number(),
    unittest: SchemaTypes.boolean(),
    libname: SchemaTypes.string(),

    include: SchemaTypes.arrayOf(SchemaTypes.string())(),
    assets: SchemaTypes.arrayOf(SchemaTypes.string())(),
    export: SchemaTypes.arrayOf(SchemaTypes.string())(),

    reference: {
        name: SchemaTypes.string(required),
        lang: SchemaTypes.string(required),
        hidden: SchemaTypes.boolean(),
    },

    tests: SchemaTypes.arrayOf({
        id: SchemaTypes.string(required),
        name: SchemaTypes.string(),
        size: SchemaTypes.number(),
        random: SchemaTypes.number(),

    })(),
};

export const ConfigEditor = (props) => {
    const [items, setItems] = useState<any[]>([]);
    const cfg = useResource<any>("test-config/ALD/2020");

    useEffect(() => {
        if(cfg) {
            const doc = yaml.safeLoad(cfg.data);
            if (!items.length) {
                setItems(doc);
            }
        }
    }, [cfg]);
    
    if (!cfg) {
        return <SimpleLoader />
    }

    const addElement = (el) => {
        setItems([...items, el]);
    }

    const updateElement = (el, index) => {
        items[index] = el
        setItems([...items]);
    }

    const removeElements = (indicies: any[]) => {
        setItems(items.filter((i, j) => !indicies.includes(j)));
    }

    return (<div className="row">
        <ArrayEditor
            type={schema}
            object={items}
            onUpdateElement={updateElement}
            onAddElement={addElement}
            onRemoveElements={removeElements}
        />
        <pre>{JSON.stringify(items, null, "    ")}</pre>
    </div>)
}