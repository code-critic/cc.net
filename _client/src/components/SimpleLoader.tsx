import { PropagateLoader } from "react-spinners";
import React from "react";
import "../styles/spinners.css"

export class SimpleLoader extends React.Component {
    render() {
        return <div className="simple-loader">
            <PropagateLoader loading/>
        </div>
    }
}