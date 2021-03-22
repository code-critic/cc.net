import React from "react";
import { Form } from "react-bootstrap";


interface DropdownBreadcrumbProps<T> {
    values: T[];
    id: (value: T) => string;
    title: (value: T) => string;
    onSelect: (value: T) => void;
    value: string;
    label?: string;
    size?: 'sm' | 'lg';
    separator?: boolean;
}

export class DropdownButtonEx<T> extends React.Component<DropdownBreadcrumbProps<T>, any, any> {
    render() {
        const { value, values, id, title, onSelect, label, size, separator } = this.props;

        return <>
            <Form.Group className="breadcrumb-item">
                {label && <Form.Label>Select course</Form.Label>}
                <Form.Control as="select" size={size}
                    onChange={e => {
                        const item = values.find(i => id(i) === (e as any).target.value);
                        if (item) onSelect(item);
                    }}
                    value={value}>
                    {values
                        .map(i => <option key={id(i)} value={id(i)}>{title(i)}</option>)
                    }
                </Form.Control>
            </Form.Group >
        </>
    }
}