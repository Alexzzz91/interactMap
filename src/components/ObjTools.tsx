import React from "react";

export function ObjTools() {
	return (
		<div id="objTools"
			className="leftBox">
			<h2>Modify door/window</h2>
			<hr/>
			<ul className="list-unstyled">
				<br/><br/>
				<li>
					<button className="btn btn-default fully"
						id="objToolsHinge">
                        REVERSE THE GONDS
					</button>
				</li>
            
				<p>Width [<span id="doorWindowWidthScale"></span>] : <span id="doorWindowWidthVal"></span> cm</p>
				<input type="range"
					id="doorWindowWidth"
					step="1"
					className="range"
				/>
				<br/>

				<li>
					<button className="btn btn-danger fully objTrash">
						<i 
							className="fa fa-2x fa-trash-o"
							aria-hidden="true"
						/>
					</button>
				</li>
				<li>
					<button 
						className="btn btn-info"
						style={{marginTop:100}}
						// onclick="fonc_button('select_mode');$('#boxinfo').html('Mode sélection');$('#objTools').hide('100');$('#panel').show('200');binder.graph.remove();delete binder;rib();"
					>
						<i 
							className="fa fa-2x fa-backward"
							aria-hidden="true"
						/>
					</button>
				</li>
			</ul>
		</div>
	);
}