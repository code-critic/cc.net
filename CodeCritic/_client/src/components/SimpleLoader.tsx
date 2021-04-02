import { BarLoader } from "react-spinners";
import React from "react";
import "../styles/spinners.css"

interface SimpleLoaderProps {
    title?: string;
}

export const SimpleLoader = (props: SimpleLoaderProps) => {
    const { title } = props;
    return <div className="simple-loader">
        <BarLoader loading />{title && <span>{title}</span>}
    </div>
}