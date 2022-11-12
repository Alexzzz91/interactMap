import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  IconButton,
  Avatar,
  Box,
  Flex,
  HStack,
  VStack,
  useColorModeValue,
  Text,
  FlexProps,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  useColorMode,
} from "@chakra-ui/react";
import {
  FiMenu,
  FiChevronDown,
  FiCornerUpLeft,
  FiCornerUpRight,
  FiTrash2,
  FiSave,
  FiMoon,
  FiSun,
} from "react-icons/fi";
import { clearHtmlTagById, initHistory, load } from "../../libs/functions";
import { Settings } from "./Settings";
import { useStore } from "effector-react";
import { $schemeName } from "../../state/settings";
import { $hasAction, $history, $mode, hasActionChange } from "../../state";
import { MODES } from "../../libs/common";
import { useThrottle } from "../../hooks/useThrottle";

interface MobileProps extends FlexProps {
    onOpen: () => void;
}
  
export const MobileNav = ({ onOpen, ...rest }: MobileProps) => {   
    const { colorMode, toggleColorMode } = useColorMode();
    const schemeName = useStore($schemeName);
    const { isOpen, onOpen: modalOnOpen, onClose } = useDisclosure();

    const history = useStore($history);
    const mode = useStore($mode);    
    const hasAction = useStore($hasAction);

    const containerRef = useRef<HTMLDivElement>(null);

    const mouseMove = useCallback(() => {
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
        if (!containerRef.current) {
            return;
        }

        containerRef.current?.addEventListener("mousemove", throttleMouseMove);
  
        return function cleanup() {
          containerRef.current?.removeEventListener("mousemove", throttleMouseMove);
        };
    }, [throttleMouseMove]);

    const handleClearHistory = () => {
        initHistory();
        clearHtmlTagById("boxSurface");
        clearHtmlTagById("boxRoom");
        clearHtmlTagById("boxwall");
        clearHtmlTagById("boxbind");
        clearHtmlTagById("boxArea");
        clearHtmlTagById("boxRib");
        clearHtmlTagById("boxboxScaleRib");
        
        window.editorVars.WALLS = [];
        window.editorVars.ROOM = [];
        window.editorVars.OBJDATA = [];
        window.editorVars.HISTORY = [];
        window.editorVars.lineIntersection = undefined;
        window.editorVars.binder = undefined;
        window.editorVars.lengthTemp = undefined;
        onClose();
    };

    const [hasHistory, setHasHistory] = useState(history.index > 0);
    const [hasNextSteps, setHasNextSteps] = useState(history.index < history.length);


    const handleOnHistoryBack = () => {
        if (history.index > 0) {
            if (history.index - 1 > 0) {
                history.index--;
                load(history.index - 1);
            }
        }
    };

    const handleOnHistoryNext = () => {
        if (history.index < history.length) {
            load(history.index);
            history.index++;
        }
    };
      
    console.log('hasHistory', hasHistory);

    useEffect(() => {
        if (history.index > 0) {
            setHasHistory(true);
        }

        if (history.index == 0) {
            setHasHistory(false);
        }

        if (history.index == history.length) {
            setHasNextSteps(false);
        }
    }, [history]);

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
            // ref={containerRef}
            {...rest}
        >
            <IconButton
                display={{ base: "flex", md: "none" }}
                onClick={onOpen}
                variant="outline"
                aria-label="open menu"
                icon={<FiMenu />}
            />

            <Flex gap={1}>
                <IconButton
                    colorScheme='teal'
                    aria-label='Шаг назад по истории'
                    variant={hasHistory ? "solid" : "outline"}
                    disabled={!hasHistory}
                    size='lg'
                    icon={<FiCornerUpLeft />}
                    onClick={handleOnHistoryBack}
                />

                <IconButton
                    colorScheme='teal'
                    aria-label='Шаг вперед по истории'
                    variant={hasNextSteps ? "solid" : "outline"}
                    disabled={!hasNextSteps}
                    size='lg'
                    icon={<FiCornerUpRight />}
                    onClick={handleOnHistoryNext}
                />

                <IconButton
                    colorScheme='teal'
                    aria-label='Очистить историю'
                    variant={hasHistory ? "solid" : "outline"}
                    disabled={!hasHistory}
                    size='lg'
                    onClick={modalOnOpen}
                    icon={<FiTrash2 />}
                />

                <Modal blockScrollOnMount={false} isOpen={isOpen} onClose={onClose}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Очистить истоию?</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Text fontWeight='bold' mb='1rem'>
                                Очистить истоию?
                            </Text>
                        </ModalBody>

                        <ModalFooter>
                            <Button colorScheme='blue' mr={3} onClick={onClose}>
                                Отменить
                            </Button>
                            <Button variant='ghost' onClick={handleClearHistory}>Очистить</Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </Flex>
            <Flex flex={1} justifyContent="center">
                <Text
                    display={{ base: "flex", md: "" }}
                    fontSize="2xl"
                    fontFamily="monospace"
                    fontWeight="bold"
                >
                    {schemeName}
                </Text>
            </Flex>
            <HStack spacing={{ base: "0", md: "6" }}>                
                <Settings />
                <IconButton
                    size="lg"
                    variant="ghost"
                    aria-label="open menu"
                    icon={<FiSave />}
                />

                <IconButton
                    size="lg"
                    variant="ghost"
                    aria-label="open menu"
                    icon={colorMode === "light" ? <FiMoon /> : <FiSun />}
                    onClick={toggleColorMode}
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