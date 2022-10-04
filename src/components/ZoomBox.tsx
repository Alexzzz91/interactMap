import React from "react";

export function ZoomBox() {
	return (
    <div 
        id="zoomBox" 
        style={{
            position: "absolute",
            zIndex: "100",
            right: "-150px",
            bottom: "20px",
            textAlign: "center",
            background: "transparent",
            padding: "0px",
            color: "#fff",
            transitionDuration: "0.2s",
            transitionTimingFunction: "ease-in",
        }}
    >
        <div 
            className="pull-right" 
            style={{
                marginRight:"10px"
            }}
        >
            <button 
                className="btn btn btn-default zoom" 
                data-zoom="zoomin" 
                style={{
                    boxShadow:"2px 2px 3px #ccc",
                }}
            >
                    <i className="fa fa-plus" aria-hidden="true"></i>
            </button>
            <button 
                className="btn btn btn-default zoom" 
                data-zoom="zoomout" 
                style={{
                    boxShadow: "2px 2px 3px #ccc",
                }}
            >
                <i className="fa fa-minus" aria-hidden="true"></i>
            </button>
        </div>
        <div 
            style={{
                clear:"both"
            }}
        />
        <div 
            id="scaleVal"  
            className="pull-right"  
            style={{
                boxShadow:"2px 2px 3px #ccc",
                width:"60px",
                height:"20px",
                background:"#4b79aa",
                borderRadius:"4px",
                marginRight:"10px",
            }}
        >
            1m
        </div>

        <div 
            style={{
                clear:"both"
            }}
        />
    </div>
	);
}