import { BarLoader, PacmanLoader } from "react-spinners";
import React from "react";
import "../styles/spinners.css"

interface SimpleLoaderProps {
    title?: string;
    size?: number;
}

export const SimpleLoader = (props: SimpleLoaderProps) => {
    const { title } = props;
    return <div className="simple-loader">
        <BarLoader loading />{title && <span>{title}</span>}
    </div>
}

export const SimplePacmanLoader = (props: SimpleLoaderProps) => {
    const { size=15 } = props;
    return <span className="fadeIn"><PacmanLoader size={size} color={"#128dc9"} /></span>
}