import React, { useCallback, useState } from "react";
import {
  IconButton,
  Box,
  Text,
  Input,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  MenuButton,
  Menu,
  MenuList,
  MenuOptionGroup,
  MenuItemOption,
} from "@chakra-ui/react";
import {
  FiSettings,
} from "react-icons/fi";
import * as classes from "./mobilenav.module.css";
import { hasBackgroundChange } from "../../state";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { schemeNameChange } from "../../state/settings";
import { $themeName, themeChange } from "../../state/theme";
import { useStore } from "effector-react";

const themes = [
    "whiteAlpha",
    "blackAlpha",
    "gray",
    "red",
    "orange",
    "yellow",
    "green",
    "teal",
    "blue",
    "cyan",
    "purple",
    "pink",
    "linkedin",
    "facebook",
    "messenger",
    "whatsapp",
    "twitter",
    "telegram"
];

export const Settings = () => {
    const themeName = useStore($themeName);
    const [tempName, setTempName] = useState("");
    const [tempBackground, setTempBackground] = useState("");
    const [_, setBackgroundImage] = useLocalStorage("backgroundImage", "");
    const { isOpen, onOpen, onClose } = useDisclosure();
    
    const handleTempNameChange = useCallback(({ currentTarget }) => {
        setTempName(currentTarget.value);
    }, []);

    const onSelectFile = ({ target }) => {
        if (!target.files || target.files.length === 0) {
            return;
        }

        const isSVG = target.files[0].type === "image/svg+xml";

        const objectUrl = URL.createObjectURL(target.files[0]);
        const curImg = new Image();

        curImg.src = objectUrl;
        curImg.onload = function(){
            document.getElementById("backgroundImage")?.appendChild(curImg);

            const canvas = document.createElement("canvas");

            canvas.width = isSVG ? document.documentElement.clientWidth : curImg.width;
            canvas.height = isSVG ? document.documentElement.clientHeight : curImg.height;

            document.body.appendChild(canvas);
            
            const context = canvas.getContext("2d");

            if (!context) {
                return;
            }

            context.drawImage(curImg, 0, 0);    
        
            const dataURL = canvas.toDataURL("image/png");
            setTempBackground(dataURL.replace(/^data:image\/(png|jpg);base64,/, ""));
        };
    };

    const onSave = useCallback(() => {
        schemeNameChange(tempName);
        setBackgroundImage(tempBackground);
        hasBackgroundChange(1);
        onClose();
    }, [tempName, tempBackground, onClose]);

    return (
        <>
            <IconButton
                size="lg"
                variant="ghost"
                aria-label="open menu"
                onClick={onOpen}
                icon={<FiSettings />}
            />
            <Modal blockScrollOnMount={false} isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Настройки</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody marginTop={5}>
                        <Box marginTop={3}>
                            <Text fontWeight='bold' mb='1rem'>
                                Название схемы
                            </Text>
                            <Input value={tempName} onChange={handleTempNameChange}>
                            </Input>
                        </Box>

                        <Box marginTop={3}>
                            <label className={classes.fileLoadLabel}>
                                Добавить фон
                                <input
                                    type="file" 
                                    onChange={onSelectFile}
                                    placeholder='Фон'
                                    className={classes.fileLoadInput}
                                />
                            </label>
                        </Box>

                        <Box marginTop={3}>
                            <Menu closeOnSelect={false}>
                                <MenuButton
                                    as={Button}               
                                    colorScheme={themeName} 
                                    className="btn btn-default fully"
                                    title=" Выбор цветовой схемы "
                                    onClick={(e) => themeChange(e.currentTarget.value)}
                                >
                                    Выбор цветовой схемы 
                                </MenuButton>
                                <MenuList>
                                    <MenuOptionGroup defaultValue='teal' title='Выбор цветовой схемы ' type='radio' onChange={(e) => themeChange(e)}>
                                    {themes.map((nextThemeName) => {
                                        return (
                                            <MenuItemOption value={nextThemeName} key={nextThemeName}>
                                                { nextThemeName }
                                            </MenuItemOption>
                                        );
                                    })}
                                    </MenuOptionGroup>
                                </MenuList>
                            </Menu>
                        </Box>
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme='blue' mr={3} onClick={onClose}>
                            Отменить
                        </Button>
                        <Button variant='ghost' onClick={onSave}>Сохранить</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal> 
        </>  
    );
};