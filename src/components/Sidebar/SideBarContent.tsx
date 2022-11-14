import React, { useCallback, useEffect, useRef } from "react";
import {
  Box,
  CloseButton,
  Flex,
  useColorModeValue,
  Text,
  BoxProps,
  Button,
  Checkbox,
  Menu,
  MenuButton,
  MenuList,
  MenuOptionGroup,
  MenuItemOption,
  Slider,
  SliderMark,
  SliderTrack,
  SliderFilledTrack,
  Tooltip,
  SliderThumb,
} from "@chakra-ui/react";
import * as classes from "./sidebar.module.css";
// import { ReactText } from "react";
import { $hasAction, $mode, $modeOptions, $multipleMode, cursorChange, hasActionChange, modeChange, modeOptionsChange, multipleModeChange } from "../../state";
import { useThrottle } from "../../hooks/useThrottle";
import { useStore } from "effector-react";
import { MODES } from "../../libs/common";
import { HiCursorClick } from "react-icons/hi";
import { TbDoor, TbSofa, TbWindow } from "react-icons/tb";
import { $themeName } from "../../state/theme";
import { ModeOptions } from "../../types/editorVars";

interface SidebarProps extends BoxProps {
  onClose: () => void;
}

export const SidebarContent = ({ onClose, ...rest }: SidebarProps) => {
    const mode = useStore($mode);
    const modeOptions = useStore($modeOptions);
    const multipleMode = useStore($multipleMode);
    
    const hasAction = useStore($hasAction);
    const themeName = useStore($themeName);

    const panelRef = useRef<Box>(null);




    const [sliderValue, setSliderValue] = React.useState(5);
    const [showTooltip, setShowTooltip] = React.useState(false);



    const handleClickSelectMode = useCallback(() => {
        cursorChange("default");
        modeChange(MODES.SELECT_MODE);
    }, []);

    const handleClickLineMode = useCallback(() => {
        cursorChange("crosshair");
        modeChange(MODES.LINE_MODE);
    }, []);

    const handleClickPartitionMode = useCallback(() => {
        cursorChange("crosshair");
        modeChange(MODES.PARTITION_MODE);
    }, []);

    const handleClickDoorMode= useCallback((valueOrEvent: React.MouseEventHandler<HTMLButtonElement> | ModeOptions | ModeOptions[]) => {
        if (typeof valueOrEvent === "string") {
            modeOptionsChange(valueOrEvent);
        }

        cursorChange("crosshair");
        modeChange(MODES.DOOR_MODE);
    }, []);

    const handleClickWindowMode= useCallback((valueOrEvent: React.MouseEventHandler<HTMLButtonElement> | ModeOptions | ModeOptions[]) => {
        if (typeof valueOrEvent === "string") {
            modeOptionsChange(valueOrEvent);
        }

        cursorChange("crosshair");
        modeChange(MODES.WINDOW_MODE);
    }, []);

    const handleClickObjectMode= useCallback((valueOrEvent: React.MouseEventHandler<HTMLButtonElement> | ModeOptions | ModeOptions[]) => {
        if (typeof valueOrEvent === "string") {
            console.log('valueOrEvent', valueOrEvent);
            modeOptionsChange(valueOrEvent);
        }

        cursorChange("crosshair");
        modeChange(MODES.OBJECT_MODE);
    }, []);

    const handleMultipleModeChange = useCallback(() => multipleModeChange(), []);

    const mouseMove = React.useCallback(() => {
        if ((mode == MODES.LINE_MODE || mode == MODES.PARTITION_MODE) && hasAction == 1) {
            
            hasActionChange(0);
            
            if (window.editorVars.binder) {
                window.editorVars.binder.remove();
                window.editorVars.binder = undefined;
            }

            document.getElementById("linetemp")?.remove();
            document.getElementById("line_construc")?.remove();

            if (window.editorVars.lengthTemp) {
                window.editorVars.lengthTemp.remove();
            }

            window.editorVars.lengthTemp = undefined;
        }
    }, [mode, hasAction]);

    const throttleMouseMove = useThrottle(() => mouseMove(), 300);

    useEffect(() => {
        if (!panelRef.current) {
            return;
        }

        panelRef.current.addEventListener("mousemove", throttleMouseMove);
  
        return function cleanup() {
          panelRef.current?.removeEventListener("mousemove", throttleMouseMove);
        };
    }, [throttleMouseMove]);

    console.log(mode === MODES.OBJECT_MODE);
    console.log(modeOptions === ModeOptions.OfficeTable);
    console.log(modeOptions);

    return (
        <Box
            ref={panelRef}
            transition="3s ease"
            bg={useColorModeValue("white", "gray.900")}
            borderRight="1px"
            borderRightColor={useColorModeValue("gray.200", "gray.700")}
            w={{ base: "full", md: 48 }}
            p="1"
            pos="fixed"
            h="full"
            zIndex={99}
            className={classes.aside}
            {...rest}
        >
            <Flex h="16" alignItems="center" mx="8" justifyContent="space-between">
                <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold">
                    Logo
                </Text>
                <CloseButton display={{ base: "flex", md: "none" }} onClick={onClose} />
            </Flex>

            <Button 
                colorScheme={themeName} 
                variant={mode === MODES.SELECT_MODE ? "solid" : "outline"}
                className="btn btn-default fully"
                title="Режим выбора"
                leftIcon={<HiCursorClick />}
                onClick={handleClickSelectMode}
            >
                Режим выбора
            </Button>

            <Button 
                colorScheme={themeName} 
                variant={mode === MODES.LINE_MODE ? "solid" : "outline"}
                className="btn btn-default fully"
                title="Сделать несущую стену"
                onClick={handleClickLineMode}
            >
                Несущая стена
            </Button>

            <Button 
                colorScheme={themeName} 
                variant={mode === MODES.PARTITION_MODE ? "solid" : "outline"}
                className="btn btn-default fully"
                title="Сделать перегородку"
                onClick={handleClickPartitionMode}
            >
                Пергородка
            </Button>

            <Menu closeOnSelect={true}>
                <MenuButton 
                    as={Button}               
                    colorScheme={themeName} 
                    variant={mode === MODES.DOOR_MODE ? "solid" : "outline"}
                    className="btn btn-default fully"
                    title="Добавить дверь"
                    leftIcon={<TbDoor />}
                >
                    Добавить дверь
                </MenuButton>
                <MenuList>
                    <MenuOptionGroup 
                        title='Добавить дверь' 
                        type='radio' 
                        onChange={handleClickDoorMode}
                    >
                        <MenuItemOption value={ModeOptions.Aperture} >
                            Дверьной проем
                        </MenuItemOption>
                        <MenuItemOption value={ModeOptions.Simple}>
                            Простая дверь
                        </MenuItemOption>
                        <MenuItemOption value={ModeOptions.Double}>
                            Двойная дверь
                        </MenuItemOption>
                        <MenuItemOption value={ModeOptions.Pocket}>
                            Слайдер
                        </MenuItemOption>
                    </MenuOptionGroup>
                </MenuList>
            </Menu>

            <Menu closeOnSelect={true}>
                <MenuButton 
                    as={Button}               
                    colorScheme={themeName} 
                    variant={mode === MODES.WINDOW_MODE ? "solid" : "outline"}
                    className="btn btn-default fully"
                    title="Добавить окно"
                    leftIcon={<TbWindow />}
                >
                    Добавить окно
                </MenuButton>
                <MenuList>
                    <MenuOptionGroup title='Добавить окно' type='radio' onChange={handleClickWindowMode}>
                        <MenuItemOption value={ModeOptions.Fix}>
                            Фиксированное стекло
                        </MenuItemOption>
                        <MenuItemOption value={ModeOptions.Flap}>
                            Простое окно
                        </MenuItemOption>
                        <MenuItemOption value={ModeOptions.Twin}>
                            Двойное окно
                        </MenuItemOption>
                        <MenuItemOption value={ModeOptions.Bay}>
                            Слайдер
                        </MenuItemOption>
                    </MenuOptionGroup>
                </MenuList>
            </Menu>

            <Menu closeOnSelect={true}>
                <MenuButton 
                    as={Button}               
                    colorScheme={themeName} 
                    variant={mode === MODES.OBJECT_MODE ? "solid" : "outline"}
                    className="btn btn-default fully"
                    title="Добавить мебель"
                    leftIcon={<TbSofa />}
                >
                    Добавить мебель
                </MenuButton>
                <MenuList>
                    <MenuOptionGroup title='Добавить мебель' type='radio' onChange={handleClickObjectMode}>
                        <MenuItemOption value={ModeOptions.OfficeTable}>
                            Рабочий офисный Стол
                        </MenuItemOption>
                    </MenuOptionGroup>
                </MenuList>
            </Menu>

            {(mode === MODES.OBJECT_MODE && modeOptions === ModeOptions.OfficeTable) && (
                <Slider
                    id='slider'
                    defaultValue={5}
                    min={0}
                    max={360}
                    colorScheme='teal'
                    onChange={(v) => setSliderValue(v)}
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                >
                    <SliderMark value={90} mt='1' ml='-2.5' fontSize='sm'>
                        90°
                    </SliderMark>
                    <SliderMark value={180} mt='1' ml='-2.5' fontSize='sm'>
                        180°
                    </SliderMark>
                    <SliderMark value={270} mt='1' ml='-2.5' fontSize='sm'>
                        270°
                    </SliderMark>
                    <SliderTrack>
                    <SliderFilledTrack />
                    </SliderTrack>
                    <Tooltip
                        hasArrow
                        bg='teal.500'
                        color='white'
                        placement='top'
                        isOpen={showTooltip}
                        label={`${sliderValue}%`}
                    >
                        <SliderThumb />
                    </Tooltip>
                </Slider>
            )}

            <Checkbox isChecked={multipleMode} onChange={handleMultipleModeChange}>
                Множество действий
            </Checkbox>
        </Box>
    );
};

