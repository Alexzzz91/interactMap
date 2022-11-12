// import { useEvent, useStore } from "effector-react";
import React, { useEffect } from "react";

import { Box, ChakraProvider } from "@chakra-ui/react";
import { 
	ThemeEditorProvider, 
	// HyperThemeEditor,
} from "@hypertheme-editor/chakra-ui";
import { theme } from "./theme";

import "@fontsource/sora/200.css";
import "@fontsource/sora/400.css";
import "@fontsource/sora/600.css";
import "@fontsource/sora/800.css";

// import { Boxinfo } from "./components/Boxinfo";
import { Linear } from "./components/Linear";
import { MoveBox } from "./components/MoveBox/MoveBox";
// import { ObjBoundingBox } from "./components/ObjBoundingBox";
// import { ObjTools } from "./components/ObjTools";
// import { Panel } from "./components/Panel";
import { SidebarWithHeader } from "./components/Sidebar/Sidebar";
// import { ReportTools } from "./components/ReportTools";
// import { RoomTools } from "./components/RoomTools";
// import { TextToLayer } from "./components/TextToLayer";
// import { WallTools } from "./components/WallTools";
// import { WelcomeModal } from "./components/Welcome";
import { ZoomBox } from "./components/ZoomBox/ZoomBox";
import { initHistory } from "./libs/functions";
import { $history, changeHistory } from "./state";
import { BootType } from "./types/editorVars";
import { useStore } from "effector-react";
// import { $cursor, $mode, pageMounted } from "./state";

export function App() {
	const history = useStore($history);
//   const currentCursor = useStore($cursor);
//   const handleAppStart = useEvent(pageMounted);
//   const currentMode = useStore($mode);

//   console.log("currentCursor", currentCursor);
//   console.log("currentMode", currentMode);

//   React.useEffect(() => {
//     console.log("handleAppStart", handleAppStart());
//   }, []);


	useEffect(() => {
		changeHistory(initHistory(history ? BootType.Recovery : BootType.Box));
	}, []);

	return (
		<ChakraProvider theme={theme}>
		 	{/* <ThemeEditorProvider> */}
				{/* <HyperThemeEditor pos="fixed" bottom={4} right={2} /> */}

				<SidebarWithHeader >
					<Box w='100%' h='100%' >
						<Linear />

						{/* <div id="areaValue" />

						<ReportTools /> */}
	{/* 
						<WallTools />

						<ObjBoundingBox />

						<ObjTools />

						<RoomTools /> */}

						{/* <Panel /> */}

						{/* <WelcomeModal />

						<TextToLayer />

						<Boxinfo /> */}

						<MoveBox />

						<ZoomBox /> 
					</Box>
				</SidebarWithHeader>

			{/* </ThemeEditorProvider> */}
		</ChakraProvider>
	);
}
