import { Component } from "react";
import React from "react";


const infinity = "∞";

interface InlineResultProps {
    result: any;
}

export class InlineResult extends Component<InlineResultProps, any, any> {
    render() {
        const model = this.props.result;
        let scores: number[];
        if (!model.rest.result) {
            scores = [6, 6, 6];
        } else {
            scores = model.rest.result.scores;
        }

        return (<div>
            <small>#{model.attempt || infinity}</small> | <span>{model.user}</span> - <code>{model.course}</code> - <span>{model.action}</span>
            <code>
                <span className="p-2">{scores[0]}</span>
                <span className="p-2">{scores[1]}</span>
                <span className="p-2">{scores[2]}</span>
            </code>
        </div>)
    }
}