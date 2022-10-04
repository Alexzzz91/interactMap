import React from "react";

export function MoveBox() {
	return (
        <div 
            id="moveBox" 
            style={{
                position: "absolute",
                right: "-150px",
                top: "10px",
                color: "#08d",
                background: "transparent",
                zIndex: 2,
                textAlign: "center",
                transitionDuration: " 0.2s",
                transitionTimingFunction: "ease-in",
            }}
        >
        <p 
            style={{
                margin:"0px 0 0 0",
                fontSize:"11px"
            }}
        >
            <img 
                src="https://cdn4.iconfinder.com/data/icons/mathematics-doodle-3/48/102-128.png"
                width='20px' 
            />
            Home Rough Editor
        </p>
        <div 
            className="pull-right" 
            style={{ margin: "10px" }}
        >
            <p style={{margin:"0"}}>
                <button 
                    className="btn btn-xs btn-info zoom"
                    data-zoom="zoomtop" 
                    style={{boxShadow: "2px 2px 3px #ccc"}}
                >
                    <i className="fa fa-arrow-up" aria-hidden="true"></i>
                </button>
            </p>
            <p style={{margin:"0"}}>
                <button 
                    className="btn btn-xs btn-info zoom" 
                    data-zoom="zoomleft" 
                    style={{boxShadow: "2px 2px 3px #ccc"}}
                >
                    <i className="fa fa-arrow-left" aria-hidden="true"></i>
                </button>
                <button 
                    className="btn btn-xs btn-default zoom" 
                    data-zoom="zoomreset" 
                    style={{boxShadow: "2px 2px 3px #ccc"}}
                >
                    <i className="fa fa-bullseye" aria-hidden="true"></i>
                </button>
                <button 
                    className="btn btn-xs btn-info zoom"
                    data-zoom="zoomright" 
                    style={{boxShadow:"2px 2px 3px #ccc"}}
                >
                    <i className="fa fa-arrow-right" aria-hidden="true"></i>
                </button>
            </p>
            <p style={{margin:"0"}}>
                <button 
                    className="btn btn-xs btn-info zoom" 
                    data-zoom="zoombottom" 
                    style={{boxShadow:"2px 2px 3px #ccc"}}
                >
                    <i className="fa fa-arrow-down" aria-hidden="true"></i>
                </button>
            </p>
        </div>
      </div>
	);
}
