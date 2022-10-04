import React from "react";

export function WelcomeModal() {
	return (
        <div 
            className="modal fade col-xs-9 col-md-12" 
            id="myModal" 
            tabIndex="-1" 
            role="dialog" 
            aria-labelledby="myModalLabel"
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
                            <span aria-hidden="true">
                                &times;
                            </span>
                        </button>
                        <h4 
                            className="modal-title" 
                            id="myModalLabel"
                        >
                            Welcome Home Rough Editor v0.93
                        </h4>
                    </div>
                    <div className="modal-body">
                        <div id="recover">
                            <p>A plan exists into historic, would you like recover him ?</p>
                            <button 
                                className="btn btn-default" 
                                // onclick="initHistory('recovery');$('#myModal').modal('toggle')"
                            >
                                OUI
                            </button>
                            <hr/>
                            <p>Or are you prefer start a new plan ?</p>
                        </div>
                        <div className="row">
                            <div 
                                className="col-md-3 col-xs-3 boxMouseOver" 
                                style={{ 
                                    minHeight: "140px",
                                    margin: "15px",
                                    background: "url('newPlanEmpty.jpg')",
                                }}
                            >
                                <img 
                                    src="newPlanEmpty.jpg" 
                                    className="img-responsive" 
                                    // onClick="initHistory();$('#myModal').modal('toggle')"
                                />
                            </div>
                            <div 
                                className="col-md-3 col-xs-3 boxMouseOver" 
                                style={{ 
                                    minHeight: "140px",
                                    margin: "15px",
                                    background: "url('newPlanEmpty.jpg')"
                                }}
                            >
                                <img 
                                    src="newPlanSquare.jpg"  
                                    className="img-responsive" 
                                    style={{ 
                                        marginTop:"10px" 
                                    }}
                                    // onClick="initHistory('newSquare');$('#myModal').modal('toggle')"
                                />
                            </div>
                            <div 
                                className="col-md-3 col-xs-3 boxMouseOver" 
                                style={{ 
                                    minHeight:"140px",
                                    margin: "15px",
                                    background: "url('newPlanEmpty.jpg')"
                                }}
                            >
                                <img src="newPlanL.jpg"  
                                    className="img-responsive" 
                                    style={{ 
                                        marginTop:"20px",
                                    }}
                                    // onClick="initHistory('newL');$('#myModal').modal('toggle')"
                                />
                            </div>
                        </div>
                    </div>
                    <div  className="modal-footer">
                        <button 
                            type="button" 
                            className="btn btn-default" 
                            data-dismiss="modal"
                        >
                            CLOSE
                        </button>
                        <button 
                            type="button" 
                            className="btn btn-primary"
                        >
                            YES
                        </button>
                    </div>
                </div>
            </div>
        </div>
	);
}
