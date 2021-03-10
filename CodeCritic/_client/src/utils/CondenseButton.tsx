
import React from "react";
import { SwitchButton } from "../components/SwitchButton";

export interface CondenseButtonProps {
    onChange: (value: string) => void
}

export class CondenseButton extends React.Component<CondenseButtonProps> {
    render () {
        return<SwitchButton
        onChange={this.props.onChange}
        statuses={[
            {value: "normal", title: "Normal density"},
            {value: "condensed", title: "Condensed density"},
            {value: "tight", title: "Tight density"},
        ]}
        />
    }


}