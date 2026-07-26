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
import { Footer } from "../components/layout/Footer";
import { useSidebarCollapsed } from "../hooks/useSidebarCollapsed";

const SIDEBAR_WIDTH = "260px";
const SIDEBAR_WIDTH_COLLAPSED = "76px";

export function RootLayout() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { collapsed } = useSidebarCollapsed();

  return (
    <Flex minH="100vh">
      <Box
        as="nav"
        display={{ base: "none", lg: "block" }}
        w={collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH}
        transition="width 0.15s ease"
        flexShrink={0}
        borderRightWidth="1px"
        borderColor="border.default"
        bg="bg.panel"
        position="sticky"
        top={0}
        h="100vh"
        overflowY="auto"
        overflowX="hidden"
        px={4}
        py={5}
      >
        <SidebarContent />
      </Box>

      <Flex flex={1} minW={0} direction="column" minH="100vh">
        <TopBar onOpenSidebar={onOpen} />
        <Container maxW="7xl" px={4} py={6} flex={1}>
          <Outlet />
        </Container>
        <Footer />
      </Flex>

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
