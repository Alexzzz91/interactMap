import React, { ReactNode } from "react";
import {
  Box,
  Flex,
  // useColorModeValue,
  Drawer,
  DrawerContent,
  useDisclosure,
} from "@chakra-ui/react";
import { MobileNav } from "./MobileNav";
import { SidebarContent } from "./SideBarContent";

export function SidebarWithHeader({
  children,
}: {
  children: ReactNode;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box minH="100vh">
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
