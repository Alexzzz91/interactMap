import React from "react";

export function ObjBoundingBox() {
	return (
		<div id="objBoundingBox" className="leftBox">
			<h2>Modify object</h2>
			<hr />
			<section id="objBoundingBoxScale">
				<p>
          Width [<span id="bboxWidthScale"></span>] :{" "}
					<span id="bboxWidthVal"></span> cm
				</p>
				<input type="range" id="bboxWidth" step="1" className="range" />
				<p>
          Length [<span id="bboxHeightScale"></span>] :{" "}
					<span id="bboxHeightVal"></span> cm
				</p>
				<input type="range" id="bboxHeight" step="1" className="range" />
			</section>

			<section id="objBoundingBoxRotation">
				<p>
					<i className="fa fa-compass" aria-hidden="true"></i> Rotation :{" "}
					<span id="bboxRotationVal"></span> °
				</p>
				<input
					type="range"
					id="bboxRotation"
					step="1"
					className="range"
					min="-180"
					max="180"
				/>
			</section>

			<div id="stepsCounter" style={{ display: "none" }}>
				<p>
					<span id="bboxSteps">
            Nb steps [2-15] : <span id="bboxStepsVal">0</span>
					</span>
				</p>
				<button className="btn btn-info" id="bboxStepsAdd">
					<i className="fa fa-plus" aria-hidden="true"></i>
				</button>
				<button className="btn btn-info" id="bboxStepsMinus">
					<i className="fa fa-minus" aria-hidden="true"></i>
				</button>
			</div>

			<div id="objBoundingBoxColor">
				<div
					className="color textEditorColor"
					data-type="gradientRed"
					style={{
						color: "#f55847",
						background: "linear-gradient(30deg, #f55847, #f00)",
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
				<div style={{ clear: "both" }} />
			</div>

			<br />
			<br />
			<button className="btn btn-danger fully" id="bboxTrash">
				<i className="fa fa-2x fa-trash-o" aria-hidden="true"></i>
			</button>
			<button
				className="btn btn-info"
				style={{ marginTop: 100 }}
				// onclick="fonc_button('select_mode');$('#boxinfo').html('Mode sélection');$('#objBoundingBox').hide(100);$('#panel').show(200);binder.graph.remove();delete binder;"
			>
				<i className="fa fa-2x fa-backward" aria-hidden="true"></i>
			</button>
		</div>
	);
}
