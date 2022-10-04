import { useStore } from "effector-react";

import React, { useEffect, useRef, useState } from "react";
import { $cursor, $mode } from "../../state";
import { useLinearEngine } from "./useLinearEngine";

export function Linear() {
	const linearRef = useRef(null);
	const currentCursor = useStore($cursor);
	const mode = useStore($mode);
	const [backroung, setBackground] = useState<string>();
	const backgroundProps = useRef({});

	useEffect(() => {
		const picture = localStorage.getItem("backgroundImage");

		if (picture) {
			const src = "data:image/png;base64," + picture;
			const img = new Image();
			img.src = src;

			backgroundProps.current = {
				height: img.height,
				width: img.width,
			};

			setBackground(src);
		}
	}, [backgroundProps]);
  
	useLinearEngine(linearRef, mode);

	return (
		<svg
			id="lin"
			ref={linearRef}
			viewBox="-773 -647.7146171693735 2693 2049.429234338747"
			preserveAspectRatio="xMidYMin slice"
			xmlns="http://www.w3.org/2000/svg"
			style={{
				zIndex: 2,
				margin: 0,
				padding: 0,
				width: "100vw",
				height: "100vh",
				position: "absolute",
				top: 0,
				left: 0,
				right: 0,
				cursor: currentCursor,
				bottom: 0,
			}}
		>
			<defs>
				<pattern
					id="smallGrid"
					width="60"
					height="60"
					patternUnits="userSpaceOnUse"
				>
					<path
						d="M 60 0 L 0 0 0 60"
						fill="none"
						stroke="#777"
						strokeWidth="0.25"
					/>
				</pattern>
				<pattern
					id="grid"
					width="180"
					height="180"
					patternUnits="userSpaceOnUse"
				>
					<rect width="180" height="180" fill="url(#smallGrid)" />
					<path
						d="M 200 10 L 200 0 L 190 0 M 0 10 L 0 0 L 10 0 M 0 190 L 0 200 L 10 200 M 190 200 L 200 200 L 200 190"
						fill="none"
						stroke="#999"
						strokeWidth="0.8"
					/>
				</pattern>
				<pattern
					id="hatch"
					width="5"
					height="5"
					patternTransform="rotate(50 0 0)"
					patternUnits="userSpaceOnUse"
				>
					<path
						d="M 0 0 L 0 5 M 10 0 L 10 10 Z"
						style={{
							stroke: "#666",
							strokeWidth: "5",
						}}
					/>
				</pattern>
			</defs>
			<g id="backgroundImage">
				<image 
					width={backgroundProps.current.width}
					height={backgroundProps.current.height}
					x="15" 
					xlinkHref={backroung} 
					y="4.5"
				/>
			</g>
			<g id="boxgrid">
				<rect
					width="8000"
					height="5000"
					x="-3500"
					y="-2000"
					fill="url(#grid)"
				/>
			</g>
			<g id="boxSurface"></g>
			<g id="boxRoom"></g>
			<g id="boxwall"></g>
			<g id="boxbind"></g>
			<g id="boxArea"></g>
			<g id="boxRib"></g>
			<g id="boxScale"></g>
		</svg>
	);
}
