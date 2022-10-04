import React from "react";

export function RoomTools() {
	return (
		<div id="roomTools" className="leftBox">
			<span style={{color:"#08d"}}>
                Home Rough Editor
			</span> estimated a surface of :<br/>
			<b>
				<span className="size" />
			</b>
			<br/><br/>
			<p>If you have the actual area, you can write it</p>
			<div className="input-group">
				<input readOnly type="text" className="form-control" id="roomSurface"  placeholder="surface réelle" aria-describedby="basic-addon2" />
				<span className="input-group-addon" id="basic-addon2">m²</span>
			</div>
			<br/>
			<input readOnly type="hidden" id="roomName" value="" />
            Wording :<br/>
			<div className="btn-group">
				<button className="btn dropdown-toggle btn-default" data-toggle="dropdown" id="roomLabel">
                    Wording of the room   <span className="caret" />
				</button>
				<ul className="dropdown-menu">
					<li><a href="#">None</a></li>
					<li><a href="#">Lounge</a></li>
					<li><a href="#">Lunchroom</a></li>
					<li><a href="#">Kitchen</a></li>
					<li><a href="#">Toilet</a></li>
					<li><a href="#">Bathroom</a></li>
					<li><a href="#">Bedroom 1</a></li>
					<li><a href="#">Bedroom 2</a></li>
					<li><a href="#">Bedroom 3</a></li>
					<li><a href="#">Locker</a></li>
					<li><a href="#">Office</a></li>
					<li><a href="#">Hall</a></li>
					<li><a href="#">Loggia</a></li>
					<li><a href="#">Bath 2</a></li>
					<li><a href="#">Toilet 2</a></li>
					<li><a href="#">Bedroom 4</a></li>
					<li><a href="#">Bedroom 5</a></li>
					<li className="divider"></li>
					<li><a href="#">Balcony</a></li>
					<li><a href="#">Terrace</a></li>
					<li><a href="#">Corridor</a></li>
					<li><a href="#">Garage</a></li>
					<li><a href="#">clearance</a></li>
				</ul>
			</div>
			<br/>
			<br/>
            Meter :
			<div className="funkyradio">
				<div className="funkyradio-success">
					<input readOnly type="checkbox" name="roomShow" value="showSurface" id="seeArea" checked/>
					<label htmlFor="seeArea">Show the surface</label>
				</div>
			</div>
			<div className="funkyradio">
				<div className="funkyradio-success">
					<input readOnly type="radio" name="roomAction" id="addAction" value="add" checked />
					<label htmlFor="addAction">Add the surface</label>
				</div>
				<div className="funkyradio-warning">
					<input readOnly type="radio" name="roomAction" id="passAction" value="pass" />
					<label htmlFor="passAction">Ignore the surface</label>
				</div>
			</div>
			<hr/>

			<p>Colors</p>
			<div 
				className="roomColor" 
				data-type="gradientRed" 
				style={{
					background:"linear-gradient(30deg, #f55847, #f00)"
				}} 
			/>
			<div 
				className="roomColor" 
				data-type="gradientYellow" 
				style={{
					background:"linear-gradient(30deg,#e4c06e, #ffb000)",
				}} 
			/>
			<div 
				className="roomColor" 
				data-type="gradientGreen" 
				style={{
					background:"linear-gradient(30deg,#88cc6c, #60c437)"
				}} 
			/>
			<div 
				className="roomColor" 
				data-type="gradientSky" 
				style={{
					background:"linear-gradient(30deg,#77e1f4, #00d9ff)"
				}} 
			/>
			<div 
				className="roomColor" 
				data-type="gradientBlue" 
				style={{
					background:"linear-gradient(30deg,#4f72a6, #284d7e)"
				}} 
			/>
			<div 
				className="roomColor" 
				data-type="gradientGrey" 
				style={{
					background:"linear-gradient(30deg,#666666, #aaaaaa)"
				}} 
			/>
			<div 
				className="roomColor" 
				data-type="gradientWhite" 
				style={{
					background:"linear-gradient(30deg,#fafafa, #eaeaea)"
				}} 
			/>
			<div 
				className="roomColor" 
				data-type="gradientOrange" 
				style={{
					background:"linear-gradient(30deg, #f9ad67, #f97f00)"
				}} 
			/>
			<div 
				className="roomColor" 
				data-type="gradientPurple" 
				style={{
					background:"linear-gradient(30deg,#a784d9, #8951da)"
				}} 
			/>
			<div 
				className="roomColor" 
				data-type="gradientPink" 
				style={{
					background:"linear-gradient(30deg,#df67bd, #e22aae)"
				}} 
			/>
			<div 
				className="roomColor" 
				data-type="gradientBlack" 
				style={{
					background:"linear-gradient(30deg,#3c3b3b, #000000)"
				}} 
			/>
			<div 
				className="roomColor" 
				data-type="gradientNeutral" 
				style={{
					background:"linear-gradient(30deg,#e2c695, #c69d56)"
				}} 
			/>
			<br/><br/>
			<p>Matérials</p>
			{/* <div 
				className="roomColor" 
				data-type="wood" 
				style={{
					background: "url('https://orig00.deviantart.ne}}/e1f2/f/2015/164/8/b/old_oak_planks___seamless_texture_by_rls0812-d8x6htl.jpg')"
				}}
			/> */}
			<div 
				className="roomColor" 
				data-type="tiles" 
				style={{
					background: "url('https://encrypted-tbn0.gstati}}.com/images?q=tbn:ANd9GcQrkoI2Eiw8ya3J_swhfpZdi_ug2sONsI6TxEd1xN5af3DX9J3R')"
				}}
			/>
			<div 
				className="roomColor" 
				data-type="granite" 
				style={{
					background: "url('https://encrypted-tbn0.gstati}}.com/images?q=tbn:ANd9GcQ9_nEMhnWVV47lxEn5T_HWxvFwkujFTuw6Ff26dRTl4rDaE8AdEQ')"
				}} 
			/>
			<div 
				className="roomColor" 
				data-type="grass" 
				style={{
					background: "url('https://encrypted-tbn0.gstati}}.com/images?q=tbn:ANd9GcRWh5nEP_Trwo96CJjev6lnKe0_dRdA63RJFaoc3-msedgxveJd')"
				}} 
			/>
			<div 
                data-type="#ff008a" 
                style={{clear:"both" }} 
            />
			<br/><br/>
			<input readOnly type="hidden" id="roomBackground" value="gradientNeutral" />
			<input readOnly type="hidden" id="roomIndex" value="" />
			<button type="button" className="btn btn-primary" id="applySurface">
                Apply
            </button>
			<button type="button" className="btn btn-danger" id="resetRoomTools">
                Cancel
            </button>
			<br/>
		</div>
	);
}