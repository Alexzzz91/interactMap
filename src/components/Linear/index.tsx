import { 
	Box,
	Button, 
	Drawer, 
	DrawerBody, 
	DrawerCloseButton, 
	DrawerContent, 
	DrawerFooter, 
	DrawerHeader, 
	DrawerOverlay, 
	Flex,
	NumberDecrementStepper, 
	NumberIncrementStepper, 
	NumberInput, 
	NumberInputField, 
	NumberInputStepper, 
	Slider, 
	SliderFilledTrack, 
	SliderThumb, 
	SliderTrack, 
	Text, 
	useDisclosure, 
} from "@chakra-ui/react";
import { useStore } from "effector-react";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { $cursor, $hasBackground, $mode, hasBackgroundChange } from "../../state";
import { $themeName } from "../../state/theme";
import { useLinearEngine } from "./useLinearEngine";

export function Linear() {
	const linearRef = useRef(null);
	const [backgroundImage, setBackgroundImage] = useLocalStorage("backgroundImage", "");
	const [backgroundConfig, setItemBackgroundConfig] = useLocalStorage("backgroundConfig", "");

	const themeName = useStore($themeName);
	const hasBackground = useStore($hasBackground);
	const currentCursor = useStore($cursor);
	const mode = useStore($mode);
	const [background, setBackground] = useState<string>(backgroundImage);
	const [backgroundProps, setBackgroundProps] = useState(backgroundConfig);

	const { isOpen, onOpen, onClose } = useDisclosure();
	const btnRef = React.useRef();

	const handleOnSave = useCallback(() => {
		setItemBackgroundConfig(backgroundProps);
		onClose();
	}, [onClose, backgroundProps]);

	const handleChangeBackgroundX = useCallback((value) => {
		setBackgroundProps(prev => ({
			...prev,
			x: Number(value)
		}));
	}, []);

	const handleChangeBackgroundY = useCallback((value) => {
		setBackgroundProps(prev => ({
			...prev,
			y: Number(value)
		}));
	}, []);

	const handleChangeRatio = useCallback((value) => {
		setBackgroundProps(prev => {
			return {
				...prev,
				width: prev.initialWidth * value,
				height: prev.initialHeight * value,
				ratio: value,
			};
		});
	}, []);

	const handleChangeOpacity = useCallback((value) => {
		setBackgroundProps(prev => {
			return {
				...prev,
				opacity: value,
			};
		});
	}, []);

	useEffect(() => {
		const picture = localStorage.getItem("backgroundImage");

		if (!backgroundImage && picture) {
			setBackgroundImage(picture);
			return;
		}

		if (backgroundImage) {
			try {
				const src = "data:image/png;base64," + JSON.parse(backgroundImage);
				const img = new Image();
				img.src = src;
	
				img.onload = () => {
					if (!backgroundConfig) {
						setBackgroundProps({
							height: img.height,
							width: img.width,
							initialHeight: img.height,
							initialWidth: img.width,
							x: 200, 
							y: 100,
							ratio: 1,
							opacity: 1,
						});
					}
					setBackground(src);
					hasBackgroundChange(1);
				};
			} catch (error) {
				console.log("backgroundImage", error);
				localStorage.removeItem("backgroundImage");
			}		
		} else {
			// hasBackgroundChange(0);
		}
	}, [backgroundImage, backgroundConfig, hasBackground]);
  
	useLinearEngine(linearRef, mode);

	return (
		<>
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
							stroke="#454"
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
							stroke="#191"
							strokeWidth="0.9"
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
				{(!!hasBackground && background) && (				
					<g id="backgroundImage">
						<image 
							width={backgroundProps.width}
							height={backgroundProps.height}
							x={backgroundProps.x}
							y={backgroundProps.y}
							xlinkHref={background}
							style={{
								opacity: backgroundProps.opacity
							}}
						/>
					</g>
				)}
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
				<g id="boxcarpentry"></g>
				<g id="boxFurniture"></g>
				<g id="boxbind"></g>
				<g id="boxArea"></g>
				<g id="boxRib"></g>
				<g id="boxScale"></g>
			</svg>
			{!!hasBackground && (
				<>
					<Button ref={btnRef} colorScheme={themeName} onClick={onOpen} zIndex='99'>
						Настроить фоновое изображение 
					</Button>
					<Drawer
						isOpen={isOpen}
						placement='bottom'
						onClose={onClose}
						finalFocusRef={btnRef}
					>
					<DrawerOverlay />
						<DrawerContent>
							<DrawerCloseButton />
							<DrawerHeader> Точная настройка положения фонового изображения</DrawerHeader>

							<DrawerBody >
								<Box flex='1'>
									<Flex>	
										<Box flex='1'>
											<Text mb='8px'> Вертикальная позиция: {backgroundProps.x} </Text>
											<Flex>
												<NumberInput maxW='100px' mr='2rem' value={backgroundProps.x} onChange={handleChangeBackgroundX}>
													<NumberInputField />
													<NumberInputStepper>
													<NumberIncrementStepper />
													<NumberDecrementStepper />
													</NumberInputStepper>
												</NumberInput>
												<Slider
													flex='1'
													focusThumbOnChange={false}
													value={backgroundProps.x}
													onChange={handleChangeBackgroundX}
													min={-1000}
													max={1000}
												>
													<SliderTrack>
													<SliderFilledTrack />
													</SliderTrack>
													<SliderThumb fontSize='sm' boxSize='32px' children={backgroundProps.x} />
												</Slider>
											</Flex>
										</Box>
									</Flex>
									<Flex>	
										<Box flex='1'>
											<Text mb='8px'> Горизонтальная позиция: {backgroundProps.y} </Text>
											<Flex>
												<NumberInput maxW='100px' mr='2rem' value={backgroundProps.y} onChange={handleChangeBackgroundY}>
													<NumberInputField />
													<NumberInputStepper>
													<NumberIncrementStepper />
													<NumberDecrementStepper />
													</NumberInputStepper>
												</NumberInput>
												<Slider
													flex='1'
													focusThumbOnChange={false}
													value={backgroundProps.y}
													onChange={handleChangeBackgroundY}
													min={-1000}
													max={1000}
												>
													<SliderTrack>
													<SliderFilledTrack />
													</SliderTrack>
													<SliderThumb fontSize='sm' boxSize='32px' children={backgroundProps.y} />
												</Slider>
											</Flex>
										</Box>
									</Flex>
								</Box>
								<Box flex='1'>
									<Flex>	
										<Box flex='1'>
											<Text mb='8px'> Размер </Text>
											<Flex>
												<NumberInput 
													maxW='100px' 
													mr='2rem' 
													value={backgroundProps.ratio} 
													onChange={handleChangeRatio} 
													precision={1} 
													min={0.1}
													max={10}
													step={0.1}
												>
													<NumberInputField />
													<NumberInputStepper>
													<NumberIncrementStepper />
													<NumberDecrementStepper />
													</NumberInputStepper>
												</NumberInput>
											</Flex>
										</Box>
										<Box flex='1'>
											<Text mb='8px'> Прозрачность </Text>
											<Flex>
												<NumberInput 
													maxW='100px' 
													mr='2rem' 
													value={backgroundProps.opacity} 
													onChange={handleChangeOpacity} 
													precision={1} 
													min={0.1}
													max={1}
													step={0.1}
												>
													<NumberInputField />
													<NumberInputStepper>
													<NumberIncrementStepper />
													<NumberDecrementStepper />
													</NumberInputStepper>
												</NumberInput>
											</Flex>
										</Box>
									</Flex>
									{/* <Flex>	
										<Box flex='1'>
											<Text mb='8px'> Высота: {backgroundProps.height} </Text>
											<Flex>
												<NumberInput maxW='100px' mr='2rem' value={backgroundProps.height} onChange={handleChangeBackgroundHeight}>
													<NumberInputField />
													<NumberInputStepper>
													<NumberIncrementStepper />
													<NumberDecrementStepper />
													</NumberInputStepper>
												</NumberInput>
												<Slider
													flex='1'
													focusThumbOnChange={false}
													value={backgroundProps.height}
													onChange={handleChangeBackgroundHeight}
													min={0}
													max={1000}
												>
													<SliderTrack>
													<SliderFilledTrack />
													</SliderTrack>
													<SliderThumb fontSize='sm' boxSize='32px' children={backgroundProps.height} />
												</Slider>
											</Flex>
										</Box>
									</Flex>
									<Flex>	
										<Box flex='1'>
											<Text mb='8px'> Ширина: {backgroundProps.width} </Text>
											<Flex>
												<NumberInput maxW='100px' mr='2rem' value={backgroundProps.width} onChange={handleChangeBackgroundWidth}>
													<NumberInputField />
													<NumberInputStepper>
													<NumberIncrementStepper />
													<NumberDecrementStepper />
													</NumberInputStepper>
												</NumberInput>
												<Slider
													flex='1'
													focusThumbOnChange={false}
													value={backgroundProps.width}
													onChange={handleChangeBackgroundWidth}
													min={0}
													max={1000}
												>
													<SliderTrack>
													<SliderFilledTrack />
													</SliderTrack>
													<SliderThumb fontSize='sm' boxSize='32px' children={backgroundProps.width} />
												</Slider>
											</Flex>
										</Box>
									</Flex> */}
								</Box>
							</DrawerBody>

							<DrawerFooter>
								<Button variant='outline' mr={3} onClick={onClose}>
									Cancel
								</Button>
								<Button colorScheme='blue' onClick={handleOnSave}>Save</Button>
							</DrawerFooter>
						</DrawerContent>
					</Drawer>
				</>
			)}
		</>
	);
}
