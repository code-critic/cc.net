import React from "react";
import { Button } from "react-bootstrap";

export interface SwitchButtonStatus {
    icon?: string,
    title?: string,
    value: string,
}

export interface SwitchButtonProps {
    statuses: SwitchButtonStatus[];
    onChange?: (value: string) => void;
}


export class SwitchButton extends React.Component<SwitchButtonProps> {
    private index: number = 0;

    public get status() {
        return this.props.statuses[this.index];
    }

    private nextStatus() {
        this.index = ++this.index >= this.props.statuses.length ? 0 : this.index;
        this.setState({ index: this.index });
        
        if (this.props.onChange) {
            this.props.onChange(this.status.value);
        }
    }

    render() {
        const status = this.status;
        return <Button onClick={() => this.nextStatus()}>
            {status.icon && <i className={status.icon} />}
            {status.title && status.title}
        </Button>
    }
}