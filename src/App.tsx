// import { useEvent, useStore } from "effector-react";
import React from "react";

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
// import { MoveBox } from "./components/MoveBox";
// import { ObjBoundingBox } from "./components/ObjBoundingBox";
// import { ObjTools } from "./components/ObjTools";
// import { Panel } from "./components/Panel";
import SidebarWithHeader from "./components/Sidebar/Sidebar";
// import { ReportTools } from "./components/ReportTools";
// import { RoomTools } from "./components/RoomTools";
// import { TextToLayer } from "./components/TextToLayer";
// import { WallTools } from "./components/WallTools";
// import { WelcomeModal } from "./components/Welcome";
// import { ZoomBox } from "./components/ZoomBox";
// import { $cursor, $mode, pageMounted } from "./state";

export function App() {
//   const currentCursor = useStore($cursor);
//   const handleAppStart = useEvent(pageMounted);
//   const currentMode = useStore($mode);

//   console.log("currentCursor", currentCursor);
//   console.log("currentMode", currentMode);

//   React.useEffect(() => {
//     console.log("handleAppStart", handleAppStart());
//   }, []);


	return (
		<ChakraProvider theme={theme}>
		 	{/* <ThemeEditorProvider> */}
				{/* <HyperThemeEditor pos="fixed" bottom={4} right={2} /> */}

				<SidebarWithHeader >
					<Box w='100%' h='100%' >
						<header>Edité par Home Rough Editor Ver.0.91</header>

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

						<Boxinfo />

						<MoveBox />

						<ZoomBox /> */}
					</Box>
				</SidebarWithHeader>

			{/* </ThemeEditorProvider> */}
		</ChakraProvider>
	);
}
