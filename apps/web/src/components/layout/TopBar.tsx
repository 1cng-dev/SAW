import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Box, Flex, IconButton, Input, InputGroup, InputLeftElement, HStack, Text } from "@chakra-ui/react";
import { Menu, Search, Shield, Bell } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useSyncStatus } from "../../api/hooks";
import { SyncStatus } from "../ui/SyncStatus";

export function TopBar({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { data: syncStatus } = useSyncStatus();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    navigate({ to: "/cves", search: { search: search || undefined } });
  }

  const latestSync = syncStatus?.data?.[0]?.lastSyncTimestamp;

  return (
    <Flex
      as="header"
      position="sticky"
      top={0}
      zIndex={10}
      align="center"
      justify="center"
      px={6}
      py={4}
      borderBottomWidth="1px"
      borderColor="border.default"
      bg="bg.surface"
      backdropFilter="blur(12px)"
      boxShadow="0 1px 3px rgba(0,0,0,0.3)"
    >
      <Flex
        w="full"
        maxW="1400px"
        align="center"
        justify="space-between"
        gap={4}
      >
        {/* Left: Menu + Logo */}
        <HStack spacing={4} align="center">
          <IconButton
            aria-label="Open menu"
            icon={<Menu size={20} />}
            variant="ghost"
            size="md"
            display={{ base: "inline-flex", lg: "none" }}
            onClick={onOpenSidebar}
            color="text.muted"
            _hover={{ color: "accent.400", bg: "charcoal.800" }}
          />
          <HStack spacing={2} display={{ base: "none", md: "flex" }}>
            <Shield size={24} color="#f97316" />
            <Text fontSize="lg" fontWeight="bold" color="accent.400">
              Sec-1CNG
            </Text>
          </HStack>
        </HStack>

        {/* Center: Search Bar */}
        <Box as="form" onSubmit={handleSubmit} flex={1} maxW="600px" mx={4}>
          <InputGroup size="md">
            <InputLeftElement pointerEvents="none" pl={4}>
              <Search size={18} color="text.muted" />
            </InputLeftElement>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search CVE ID, vendor, keyword…"
              borderRadius="full"
              pl={12}
              pr={4}
              py={6}
              bg="charcoal.800"
              borderColor="border.default"
              _hover={{ borderColor: "accent.400" }}
              _focus={{ 
                borderColor: "accent.400", 
                boxShadow: "0 0 0 2px rgba(249, 115, 22, 0.2)",
                bg: "charcoal.900"
              }}
              color="text.primary"
              _placeholder={{ color: "text.muted" }}
            />
          </InputGroup>
        </Box>

        {/* Right: Actions */}
        <HStack spacing={3} align="center">
          <IconButton
            aria-label="Notifications"
            icon={<Bell size={18} />}
            variant="ghost"
            size="md"
            color="text.muted"
            _hover={{ color: "accent.400", bg: "charcoal.800" }}
          />
          <SyncStatus lastSync={latestSync} expectedInterval={30 * 60 * 1000} />
          <ThemeToggle />
        </HStack>
      </Flex>
    </Flex>
  );
}
