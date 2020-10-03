import { BarLoader } from "react-spinners";
import React from "react";
import "../styles/spinners.css"

interface SimpleLoaderProps {
    title?: string;
}

export class SimpleLoader extends React.Component<SimpleLoaderProps, any, any> {
    render() {
        const { title } = this.props;
        return <div className="simple-loader">
            <BarLoader loading />{title && <span>{title}</span>}
        </div>
    }
}