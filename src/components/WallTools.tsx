import React from "react";

export function WallTools() {
	return (
		<div id="wallTools" className="leftBox">
			<h2 id="titleWallTools">Modify the wall</h2>
			<hr />
			<section id="rangeThick">
				<p>
          Width [<span id="wallWidthScale" />] : <span id="wallWidthVal" /> cm{" "}
				</p>
				<input type="range" id="wallWidth" step="0.1" className="range" />
			</section>
			<ul className="list-unstyled">
				<section id="cutWall">
					<p>
            Cut the wall :<br />
						<small>A cut will be made at each wall encountered.</small>
					</p>
					<li>
						<button
							className="btn btn-default fully"
							// onclick="editor.splitWall();"
						>
							<i className="fa fa-2x fa-cutlery" aria-hidden="true" />
						</button>
					</li>
				</section>
				<br />
				<section id="separate">
					<p>
            Separation wall :<br />
						<small>Transform the wall into simple separation line.</small>
					</p>
					<li>
						<button
							className="btn btn-default fully"
							// onclick="editor.invisibleWall();"
							id="wallInvisible"
						>
							<i className="fa fa-2x fa-crop" aria-hidden="true" />
						</button>
					</li>
				</section>
				<section id="recombine">
					<p>
            Transform to wall :<br />
						<small>The thickness will be identical to the last known.</small>
					</p>
					<li>
						<button
							className="btn btn-default fully"
							// onclick="editor.visibleWall();"
							id="wallVisible"
						>
							<i className="fa fa-2x fa-crop" aria-hidden="true"></i>
						</button>
					</li>
				</section>
				<br />
				<li>
					<button className="btn btn-danger fully" id="wallTrash">
						<i className="fa fa-2x fa-trash-o" aria-hidden="true" />
					</button>
				</li>
				<li>
					<button
						className="btn btn-info fully"
						style={{ marginTop: 50 }}
						// onclick="fonc_button('select_mode');$('#boxinfo').html('Mode sélection');$('#wallTools').hide('300');$('#panel').show('300');"
					>
						<i className="fa fa-2x fa-backward" aria-hidden="true" />
					</button>
				</li>
			</ul>
		</div>
	);
}
