import React, { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import {
  IconButton,
  Avatar,
  Box,
  CloseButton,
  Flex,
  HStack,
  VStack,
//   Icon,
  useColorModeValue,
//   Link,
  Drawer,
  DrawerContent,
  Text,
  useDisclosure,
  BoxProps,
  FlexProps,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Button,
  Checkbox,
//   ButtonGroup,
} from "@chakra-ui/react";
import {
  FiMenu,
  FiBell,
  FiChevronDown,
} from "react-icons/fi";
import * as classes from "./sidebar.module.css";
// import { ReactText } from "react";
import { $hasAction, $mode, $multipleMode, cursorChange, hasActionChange, modeChange, multipleModeChange } from "../../state";
import { useThrottle } from "../../hooks/useThrottle";
import { useStore } from "effector-react";
import { MODES } from "../../libs/common";


export default function SidebarWithHeader({
  children,
}: {
  children: ReactNode;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box minH="100vh" bg={useColorModeValue("gray.100", "gray.900")}>
        <SidebarContent
            onClose={() => onClose}
            display={{ base: "none", md: "block" }}
        />
        <Drawer
            autoFocus={false}
            isOpen={isOpen}
            placement="left"
            onClose={onClose}
            returnFocusOnClose={false}
            onOverlayClick={onClose}
            size="full"
        >
            <DrawerContent>
                <SidebarContent onClose={onClose} />
            </DrawerContent>
        </Drawer>

        {/* mobilenav */}
        <MobileNav onOpen={onOpen} />

        <Flex color='white'>
            <Box ml={{ base: 0, md: 48 }} p="1" w='100%' h='100%'>
                {children}
            </Box>
        </Flex >
    </Box>
  );
}

interface SidebarProps extends BoxProps {
  onClose: () => void;
}

const SidebarContent = ({ onClose, ...rest }: SidebarProps) => {
    const mode = useStore($mode);
    const multipleMode = useStore($multipleMode);
    
    const hasAction = useStore($hasAction);

    const panelRef = useRef<Box>(null);

    const handleClickLineMode = useCallback(() => {
        cursorChange("crosshair");
        modeChange(MODES.LINE_MODE);
    }, []);

    const handleClickPartitionMode = useCallback(() => {
        cursorChange("crosshair");
        modeChange(MODES.PARTITION_MODE);
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
    }, [mode]);

    const throttleMouseMove = useThrottle(() => mouseMove(), 300);

    useEffect(() => {
        if (!panelRef.current) {
            return;
        }

        panelRef.current.addEventListener("mousemove", throttleMouseMove);
  
        return function cleanup() {
          panelRef.current?.removeEventListener("mousemove", throttleMouseMove);
        };
    }, []);

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
                colorScheme='teal' 
                variant='outline'
                className="btn btn-default fully"
                title="Сделать несущую стену"
                onClick={handleClickLineMode}
            >
                Несущая стена
            </Button>


            <Button 
                colorScheme='teal' 
                variant='outline'
                className="btn btn-default fully"
                title="Сделать перегородку"
                onClick={handleClickPartitionMode}
            >
                Пергородка
            </Button>

            <Checkbox isChecked={multipleMode} onChange={handleMultipleModeChange}>Множество действий</Checkbox>
        </Box>
    );
};

interface MobileProps extends FlexProps {
  onOpen: () => void;
}

const MobileNav = ({ onOpen, ...rest }: MobileProps) => {    
    const onSelectFile = e => {
        if (!e.target.files || e.target.files.length === 0) {
            return;
        }

        const objectUrl = URL.createObjectURL(e.target.files[0]);
        const curImg = new Image();

        curImg.src = objectUrl;
        curImg.onload = function(){
            document.getElementById("backgroundImage")?.appendChild(curImg);

            const canvas = document.createElement("canvas");
            canvas.width = curImg.width;
            canvas.height = curImg.height;
            document.body.appendChild(canvas);
            
            const context = canvas.getContext("2d");
            context.drawImage(curImg, 0, 0);    
        
            const dataURL = canvas.toDataURL("image/png");
            
            localStorage.setItem("backgroundImage", dataURL.replace(/^data:image\/(png|jpg);base64,/, "")); // save image data
        };
    };

    return (
        <Flex
            ml={{ base: 0, md: 48 }}
            px={{ base: 4, md: 4 }}
            height="14"
            zIndex={99}
            alignItems="center"
            position="relative"
            bg={useColorModeValue("white", "gray.900")}
            borderBottomWidth="1px"
            borderBottomColor={useColorModeValue("gray.200", "gray.700")}
            justifyContent={{ base: "space-between", md: "flex-end" }}
            {...rest}
        >
            <IconButton
                display={{ base: "flex", md: "none" }}
                onClick={onOpen}
                variant="outline"
                aria-label="open menu"
                icon={<FiMenu />}
            />

            <Text
                display={{ base: "flex", md: "" }}
                fontSize="2xl"
                fontFamily="monospace"
                fontWeight="bold"
            >
                Logo
            </Text>

            <HStack spacing={{ base: "0", md: "6" }}>
                <input 
                    type="file" 
                    onChange={onSelectFile}
                />
                <IconButton
                    size="lg"
                    variant="ghost"
                    aria-label="open menu"
                    icon={<FiBell />}
                />
                <Flex alignItems={"center"}>
                    <Menu>
                        <MenuButton
                            py={2}
                            transition="all 0.3s"
                            _focus={{ boxShadow: "none" }}
                        >
                            <HStack>
                                <Avatar
                                    size={"sm"}
                                    src={
                                    "https://images.unsplash.com/photo-1619946794135-5bc917a27793?ixlib=rb-0.3.5&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&s=b616b2c5b373a80ffc9636ba24f7a4a9"
                                    }
                                />
                                <VStack
                                    display={{ base: "none", md: "flex" }}
                                    alignItems="flex-start"
                                    spacing="1px"
                                    ml="2"
                                >
                                    <Text fontSize="sm">
                                        Justina Clark
                                    </Text>
                                    <Text fontSize="xs" color="gray.600">
                                        Admin
                                    </Text>
                                </VStack>
                                <Box display={{ base: "none", md: "flex" }}>
                                    <FiChevronDown />
                                </Box>
                            </HStack>
                        </MenuButton>
                        <MenuList
                            bg={useColorModeValue("white", "gray.900")}
                            borderColor={useColorModeValue("gray.200", "gray.700")}
                        >
                            <MenuItem>Profile</MenuItem>
                            <MenuItem>Settings</MenuItem>
                            <MenuItem>Billing</MenuItem>
                            <MenuDivider />
                            <MenuItem>Sign out</MenuItem>
                        </MenuList>
                    </Menu>
                </Flex>
            </HStack>
        </Flex>
    );
};