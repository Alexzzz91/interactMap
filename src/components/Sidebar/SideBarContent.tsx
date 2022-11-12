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
} from "@chakra-ui/react";
import * as classes from "./sidebar.module.css";
// import { ReactText } from "react";
import { $hasAction, $mode, $multipleMode, cursorChange, hasActionChange, modeChange, modeOptionsChange, multipleModeChange } from "../../state";
import { useThrottle } from "../../hooks/useThrottle";
import { useStore } from "effector-react";
import { MODES } from "../../libs/common";
import { HiCursorClick } from "react-icons/hi";
import { TbDoor, TbWindow } from "react-icons/tb";
import { $themeName } from "../../state/theme";

interface SidebarProps extends BoxProps {
  onClose: () => void;
}

export const SidebarContent = ({ onClose, ...rest }: SidebarProps) => {
    const mode = useStore($mode);
    const multipleMode = useStore($multipleMode);
    
    const hasAction = useStore($hasAction);
    const themeName = useStore($themeName);

    const panelRef = useRef<Box>(null);

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

    const handleClickDoorMode= useCallback((valueOrEvent) => {
        if (typeof valueOrEvent === "string") {
            modeOptionsChange(valueOrEvent);
        }

        cursorChange("crosshair");
        modeChange(MODES.DOOR_MODE);
    }, []);

    const handleClickWindowMode= useCallback((valueOrEvent) => {
        if (typeof valueOrEvent === "string") {
            modeOptionsChange(valueOrEvent);
        }

        cursorChange("crosshair");
        modeChange(MODES.WINDOW_MODE);
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

            <Menu closeOnSelect={false}>
                <MenuButton 
                    as={Button}               
                    colorScheme={themeName} 
                    variant={mode === MODES.DOOR_MODE ? "solid" : "outline"}
                    className="btn btn-default fully"
                    title="Добавить дверь"
                    leftIcon={<TbDoor />}
                    onClick={handleClickDoorMode}
                >
                    Добавить дверь
                </MenuButton>
                <MenuList>
                    <MenuOptionGroup 
                        defaultValue='aperture' 
                        title='Добавить дверь' 
                        type='radio' 
                        onChange={handleClickDoorMode}
                    >
                        <MenuItemOption value='aperture' >
                            Дверьной проем
                        </MenuItemOption>
                        <MenuItemOption value='simple'>
                            Простая дверь
                        </MenuItemOption>
                        <MenuItemOption value='double'>
                            Двойная дверь
                        </MenuItemOption>
                        <MenuItemOption value='pocket'>
                            Слайдер
                        </MenuItemOption>
                    </MenuOptionGroup>
                </MenuList>
            </Menu>

            <Menu closeOnSelect={false}>
                <MenuButton 
                    as={Button}               
                    colorScheme={themeName} 
                    variant={mode === MODES.WINDOW_MODE ? "solid" : "outline"}
                    className="btn btn-default fully"
                    title="Добавить окно"
                    leftIcon={<TbWindow />}
                    onClick={handleClickWindowMode}
                >
                    Добавить окно
                </MenuButton>
                <MenuList>
                    <MenuOptionGroup defaultValue='fix' title='Добавить окно' type='radio' onChange={handleClickWindowMode}>
                        <MenuItemOption value='fix'>
                            Фиксированное стекло
                        </MenuItemOption>
                        <MenuItemOption value='flap'>
                            Простое окно
                        </MenuItemOption>
                        <MenuItemOption value='twin'>
                            Двойное окно
                        </MenuItemOption>
                        <MenuItemOption value='bay'>
                            Слайдер
                        </MenuItemOption>
                    </MenuOptionGroup>
                </MenuList>
            </Menu>

            <Checkbox isChecked={multipleMode} onChange={handleMultipleModeChange}>
                Множество действий
            </Checkbox>
        </Box>
    );
};

