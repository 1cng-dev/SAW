import { IconButton, useColorMode } from "@chakra-ui/react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <IconButton
      aria-label="Toggle theme"
      onClick={toggleColorMode}
      variant="outline"
      size="sm"
      icon={colorMode === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    />
  );
}
