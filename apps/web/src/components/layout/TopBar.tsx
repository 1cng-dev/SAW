import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Box, Flex, IconButton, Input, InputGroup, InputLeftElement, HStack } from "@chakra-ui/react";
import { Menu, Search } from "lucide-react";
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
      gap={3}
      px={4}
      py={3}
      borderBottomWidth="1px"
      borderColor="border.default"
      bg="bg.surface"
      backdropFilter="blur(8px)"
    >
      <IconButton
        aria-label="Open menu"
        icon={<Menu size={18} />}
        variant="outline"
        size="sm"
        display={{ base: "inline-flex", lg: "none" }}
        onClick={onOpenSidebar}
      />

      <Box as="form" onSubmit={handleSubmit} flex={1} maxW="lg">
        <InputGroup size="sm">
          <InputLeftElement pointerEvents="none">
            <Search size={16} opacity={0.5} />
          </InputLeftElement>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search CVE ID, vendor, keyword…"
            borderRadius="md"
          />
        </InputGroup>
      </Box>

      <HStack spacing={4} ml="auto" align="center">
        <SyncStatus lastSync={latestSync} expectedInterval={30 * 60 * 1000} />
        <ThemeToggle />
      </HStack>
    </Flex>
  );
}
