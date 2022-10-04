import React from "react";

export function TextToLayer() {
	return (
        <div 
            className="modal fade" 
            id="textToLayer" 
            tabIndex={-1}
            role="dialog" 
            aria-labelledby="textToLayerLabel"
        >
        <div 
            className="modal-dialog" 
            role="document"
        >
            <div className="modal-content">
                <div className="modal-header">
                    <button 
                        type="button" 
                        className="close" 
                        data-dismiss="modal" 
                        aria-label="Close"
                    >
                        <span aria-hidden="true">&times;</span>
                    </button>
                    <h4 
                        className="modal-title" 
                        id="textToLayerLabel"
                    >
                        Text editor
                    </h4>
                </div>
                <div className="modal-body">
                <p>Choose police color</p>
                    <div 
                        className="color textEditorColor"
                        data-type="gradientRed"
                        style={{
                            color: "#f55847",
                            background:"linear-gradient(30deg, #f55847, #f00)"
                        }}
                    />
                    <div 
                        className="color textEditorColor"
                        data-type="gradientYellow"
                        style={{
                            color: "#e4c06e",
                            background: "linear-gradient(30deg,#e4c06e, #ffb000)",
                        }} 
                    />
                    <div 
                        className="color textEditorColor"
                        data-type="gradientGreen"
                        style={{
                            color: "#88cc6c",
                            background: "linear-gradient(30deg,#88cc6c, #60c437)",
                        }} 
                    />
                    <div 
                        className="color textEditorColor"
                        data-type="gradientSky"
                        style={{
                            color: "#77e1f4",
                            background: "linear-gradient(30deg,#77e1f4, #00d9ff)",
                        }} 
                    />
                    <div 
                        className="color textEditorColor"
                        data-type="gradientBlue"
                        style={{
                            color: "#4f72a6",
                            background: "linear-gradient(30deg,#4f72a6, #284d7e)",
                        }} 
                    />
                    <div 
                        className="color textEditorColor"
                        data-type="gradientGrey"
                        style={{
                            color: "#666666",
                            background: "linear-gradient(30deg,#666666, #aaaaaa)",
                        }} 
                    />
                    <div 
                        className="color textEditorColor"
                        data-type="gradientWhite"
                        style={{
                            color: "#fafafa",
                            background: "linear-gradient(30deg,#fafafa, #eaeaea)",
                        }} 
                    />
                    <div 
                        className="color textEditorColor"
                        data-type="gradientOrange"
                        style={{
                            color: "#f9ad67",
                            background: "linear-gradient(30deg, #f9ad67, #f97f00)",
                        }} 
                    />
                    <div 
                        className="color textEditorColor"
                        data-type="gradientPurple"
                        style={{
                            color: "#a784d9",
                            background: "linear-gradient(30deg,#a784d9, #8951da)",
                        }} 
                    />
                    <div 
                        className="color textEditorColor"
                        data-type="gradientPink"
                        style={{
                            color: "#df67bd",
                            background: "linear-gradient(30deg,#df67bd, #e22aae)",
                        }} 
                    />
                    <div 
                        className="color textEditorColor"
                        data-type="gradientBlack"
                        style={{
                            color: "#3c3b3b",
                            background: "linear-gradient(30deg,#3c3b3b, #000000)",
                        }} 
                    />
                    <div 
                        className="color textEditorColor"
                        data-type="gradientNeutral"
                        style={{
                            color: "#e2c695",
                            background: "linear-gradient(30deg,#e2c695, #c69d56)",
                        }} 
                    />
                    <div style={{clear: "both"}}/>
                    <hr/>
                    <p>Police size</p>
                    <input 
                        type="range" 
                        list="tickmarks" 
                        id="sizePolice" 
                        step="0.1" 
                        min="10" 
                        max="30" 
                        value="15" 
                        className="range" 
                        style={{width:200}}
                        readOnly
                    />
                    <hr/>
                    <p 
                        // contentEditable="true" 
                        id="labelBox" 
                        // onFocus="this.innerHTML='';" 
                        style={{
                            fontSize:15,
                            padding:5,
                            borderRadius: 5,
                            color:"#333",
                        }}
                    >
                        Your text
                    </p>
                </div>
                <div className="modal-footer">
                    <button 
                        type="button" 
                        className="btn btn-default" 
                        data-dismiss="modal"
                    >
                        Cancel
                    </button>
                    <button 
                        type="button" 
                        className="btn btn-primary" 
                        // onClick="$('#textToLayer').modal('hide');"
                    >
                        Apply
                    </button>
                </div>
            </div>
        </div>
        </div>
	);
}
