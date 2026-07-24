import { Outlet } from "@tanstack/react-router";
import {
  Box,
  Container,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  Flex,
  useDisclosure,
} from "@chakra-ui/react";
import { SidebarContent } from "../components/layout/SidebarContent";
import { TopBar } from "../components/layout/TopBar";

const SIDEBAR_WIDTH = "260px";

export function RootLayout() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Flex minH="100vh">
      <Box
        as="nav"
        display={{ base: "none", lg: "block" }}
        w={SIDEBAR_WIDTH}
        flexShrink={0}
        borderRightWidth="1px"
        borderColor="border.default"
        bg="bg.panel"
        position="sticky"
        top={0}
        h="100vh"
        overflowY="auto"
        px={4}
        py={5}
      >
        <SidebarContent />
      </Box>

      <Box flex={1} minW={0}>
        <TopBar onOpenSidebar={onOpen} />
        <Container maxW="7xl" px={4} py={6}>
          <Outlet />
        </Container>
      </Box>

      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bg="bg.panel" px={2} py={5}>
          <DrawerCloseButton />
          <DrawerBody>
            <SidebarContent onNavigate={onClose} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Flex>
  );
}
