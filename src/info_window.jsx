import React from "react";
import "./css/info_window.css";
function info_window(props){
    return(
        <div className="info_window">
            <h3>this is the inside</h3>
            <div className="info_window_inner">
                <h3>this is the inside</h3>
                <button className="close-btn">close</button>
                { props.children }
            </div>
        </div>
    ) ;
}
export default info_window