import React from "react";

export function ReportTools() {
	return (
		<div
			id="reportTools"
			className="leftBox"
			style={{
				width: "500px",
				overflowY: "scroll",
				overflowX: "hidden",
			}}
		>
			<h2>
				<i className="fa fa-calculator" aria-hidden="true" />
        Report plan.
			</h2>

			<br />
			<br />

			<h2
				className="toHide"
				id="reportTotalSurface"
				style={{ display: "none" }}
			/>
			<h2
				className="toHide"
				id="reportNumberSurface"
				style={{ display: "none" }}
			/>

			<hr />
			<section
				id="reportRooms"
				className="toHide"
				style={{ display: "none" }}
			/>
			<button
				className="btn btn-info fully"
				style={{ marginTop: 50 }}
				// onClick="$('#reportTools').hide('500', function(){$('#panel').show(300);});mode = 'select_mode';"
			>
				<i className="fa fa-2x fa-backward" aria-hidden="true" />
			</button>
		</div>
	);
}
