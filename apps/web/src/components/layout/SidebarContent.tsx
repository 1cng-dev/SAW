import { Link, useRouterState } from "@tanstack/react-router";
import { Avatar, Badge, Box, HStack, IconButton, Image, Stack, Text, Tooltip } from "@chakra-ui/react";
import { ChevronsLeft, ChevronsRight, Settings } from "lucide-react";
import { NAV_LINKS, type BadgeKey } from "./navLinks";
import { useWatchlist } from "../../hooks/useWatchlist";
import { useSidebarCollapsed } from "../../hooks/useSidebarCollapsed";
import { useIncidents, usePatchTasks } from "../../api/hooks";

const BRAND_URL = "https://1cloudng.com/";

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { watchlist } = useWatchlist();
  const { collapsed, toggle } = useSidebarCollapsed();
  const incidents = useIncidents();
  const patchTasks = usePatchTasks();
  const activeBg = "whiteAlpha.100";
  const activeColor = "accent.400";
  const inactiveColor = "text.muted";
  const hoverBg = "whiteAlpha.50";

  // Real counts only — no fabricated "unread" numbers.
  const openIncidentCount = incidents.data?.data.filter((i) => i.status === "open" || i.status === "investigating").length ?? 0;
  const overduePatchCount =
    patchTasks.data?.data.filter((t) => {
      if (t.status !== "not_started" && t.status !== "in_progress") return false;
      if (t.dueDate) return new Date(t.dueDate) < new Date();
      const disclosureDays = t.cvePublishedDate ? Math.floor((Date.now() - new Date(t.cvePublishedDate).getTime()) / 86400000) : 0;
      return (t.cveSeverity === "critical" || t.cveSeverity === "high") && disclosureDays > 30;
    }).length ?? 0;

  const badgeCounts: Record<BadgeKey, number> = {
    watchlist: watchlist.cveIds.length,
    openIncidents: openIncidentCount,
    overduePatches: overduePatchCount,
  };

  // Sidebar collapse is a desktop-only affordance; the mobile drawer (passed
  // onNavigate) always renders expanded since it's already an overlay.
  const isCollapsed = collapsed && !onNavigate;

  const renderLinks = (links: typeof NAV_LINKS) =>
    links.map((link) => {
      const isActive = link.to === "/" ? pathname === "/" : pathname.startsWith(link.to);
      const Icon = link.icon;
      const count = link.badgeKey ? badgeCounts[link.badgeKey] : 0;
      const row = (
        <HStack
          spacing={3}
          px={3}
          py={2}
          borderRadius="md"
          bg={isActive ? activeBg : "transparent"}
          color={isActive ? activeColor : inactiveColor}
          fontWeight={isActive ? "semibold" : "normal"}
          _hover={{ bg: isActive ? activeBg : hoverBg }}
          transition="background 0.1s ease"
          justify={isCollapsed ? "center" : "flex-start"}
        >
          <Icon size={17} />
          {!isCollapsed && (
            <>
              <Text fontSize="sm" flex={1}>{link.label}</Text>
              {count > 0 && (
                <Badge colorScheme="orange" borderRadius="full" fontSize="10px" px={2}>
                  {count}
                </Badge>
              )}
            </>
          )}
        </HStack>
      );
      return (
        <Link key={link.to} to={link.to} onClick={onNavigate}>
          {isCollapsed ? (
            <Tooltip label={count > 0 ? `${link.label} (${count})` : link.label} placement="right">
              {row}
            </Tooltip>
          ) : (
            row
          )}
        </Link>
      );
    });

  return (
    <Stack spacing={6} h="full">
      <HStack justify="space-between" align="center">
        <a href={BRAND_URL} target="_blank" rel="noopener noreferrer" style={{ flex: 1, minWidth: 0 }}>
          <HStack spacing={2} px={2}>
            <Image src="https://1cloudng.com/assets/logo-FdfyqxLo.png" alt="1CNG" h="22px" w="auto" flexShrink={0} />
            {!isCollapsed && (
              <Text fontWeight="semibold" letterSpacing="tight" fontSize="lg" noOfLines={1}>
                1CNG Security Advisory
              </Text>
            )}
          </HStack>
        </a>
        {!onNavigate && (
          <IconButton
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            icon={collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
            size="xs"
            variant="ghost"
            color="text.muted"
            onClick={toggle}
          />
        )}
      </HStack>

      <Stack spacing={3} flex={1} overflowY="auto">
        {!isCollapsed && (
          <Text fontSize="xs" fontWeight="bold" color="text.muted" px={3} letterSpacing="wide">
            MENU
          </Text>
        )}
        <Stack spacing={1}>{renderLinks(NAV_LINKS.filter((l) => l.section === "MAIN"))}</Stack>

        {!isCollapsed && (
          <Text fontSize="xs" fontWeight="bold" color="text.muted" px={3} letterSpacing="wide" mt={3}>
            ADDITIONAL
          </Text>
        )}
        <Stack spacing={1}>{renderLinks(NAV_LINKS.filter((l) => l.section === "ADDITIONAL"))}</Stack>
      </Stack>

      {/* User profile stub — no real auth/session system exists yet */}
      <Box borderTopWidth="1px" borderColor="border.default" pt={3}>
        <HStack spacing={3} px={isCollapsed ? 0 : 2} justify={isCollapsed ? "center" : "flex-start"}>
          <Avatar size="sm" name="Guest" bg="accent.solid" />
          {!isCollapsed && (
            <Box flex={1} minW={0}>
              <Text fontSize="sm" fontWeight="medium" noOfLines={1}>Guest Session</Text>
              <Text fontSize="xs" color="text.muted" noOfLines={1}>1Cloud Next Generation</Text>
            </Box>
          )}
          {!isCollapsed && (
            <Link to="/notification-settings">
              <IconButton aria-label="Settings" icon={<Settings size={14} />} size="xs" variant="ghost" color="text.muted" />
            </Link>
          )}
        </HStack>
      </Box>
    </Stack>
  );
}
