import { Link, useRouterState } from "@tanstack/react-router";
import { HStack, Stack, Text } from "@chakra-ui/react";
import { ShieldHalf } from "lucide-react";
import { NAV_LINKS } from "./navLinks";

const BRAND_URL = "https://1cloudng.com/";

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const activeBg = "whiteAlpha.100";
  const activeColor = "accent.400";
  const inactiveColor = "text.muted";
  const hoverBg = "whiteAlpha.50";

  const mainLinks = NAV_LINKS.filter((link) => link.section === "MAIN");
  const additionalLinks = NAV_LINKS.filter((link) => link.section === "ADDITIONAL");

  return (
    <Stack spacing={6} h="full">
      {/* Brand mark links out to the parent company site, not the in-app dashboard. */}
      <a href={BRAND_URL} target="_blank" rel="noopener noreferrer">
        <HStack spacing={2} px={2}>
          <ShieldHalf size={22} color="#f97316" />
          <Text fontWeight="semibold" letterSpacing="tight" fontSize="lg">
            1CNG Security Advisory
          </Text>
        </HStack>
      </a>

      {/* MAIN Section */}
      <Stack spacing={3}>
        <Text fontSize="xs" fontWeight="bold" color="text.muted" px={3} letterSpacing="wide">
          MENU
        </Text>
        <Stack spacing={1}>
          {mainLinks.map((link) => {
            const isActive = link.to === "/" ? pathname === "/" : pathname.startsWith(link.to);
            const Icon = link.icon;
            return (
              <Link key={link.to} to={link.to} onClick={onNavigate}>
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
                >
                  <Icon size={17} />
                  <Text fontSize="sm">{link.label}</Text>
                </HStack>
              </Link>
            );
          })}
        </Stack>
      </Stack>

      {/* ADDITIONAL Section */}
      <Stack spacing={3}>
        <Text fontSize="xs" fontWeight="bold" color="text.muted" px={3} letterSpacing="wide">
          ADDITIONAL
        </Text>
        <Stack spacing={1}>
          {additionalLinks.map((link) => {
            const isActive = link.to === "/" ? pathname === "/" : pathname.startsWith(link.to);
            const Icon = link.icon;
            return (
              <Link key={link.to} to={link.to} onClick={onNavigate}>
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
                >
                  <Icon size={17} />
                  <Text fontSize="sm">{link.label}</Text>
                </HStack>
              </Link>
            );
          })}
        </Stack>
      </Stack>
    </Stack>
  );
}
