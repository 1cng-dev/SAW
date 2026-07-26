import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  ShieldHalf,
  Newspaper,
  FileText,
  Skull,
  Megaphone,
  Search,
  Star,
  Globe,
  FileDown,
  Info,
  Radar,
} from "lucide-react";

export interface NavLinkDef {
  to: string;
  label: string;
  icon: LucideIcon;
  section?: "MAIN" | "ADDITIONAL";
}

export const NAV_LINKS: NavLinkDef[] = [
  // MAIN
  { to: "/", label: "Dashboard", icon: LayoutDashboard, section: "MAIN" },
  { to: "/cves", label: "CVE Database", icon: ShieldHalf, section: "MAIN" },
  { to: "/news", label: "Cyber News", icon: Newspaper, section: "MAIN" },
  { to: "/threat-reports", label: "Threat Reports", icon: FileText, section: "MAIN" },
  { to: "/ransomware-tracker", label: "Ransomware Group Tracker", icon: Skull, section: "MAIN" },
  { to: "/announcements", label: "1CNG Security Announcement", icon: Megaphone, section: "MAIN" },

  // ADDITIONAL
  { to: "/threat-intel", label: "Threat Intel / IOC Lookup", icon: Search, section: "ADDITIONAL" },
  { to: "/osint", label: "OSINT / Network Search", icon: Radar, section: "ADDITIONAL" },
  { to: "/watchlist", label: "CVE Watchlist", icon: Star, section: "ADDITIONAL" },
  { to: "/attack-map", label: "Global Attack/Advisory Map", icon: Globe, section: "ADDITIONAL" },
  { to: "/digest", label: "Weekly Security Digest", icon: FileDown, section: "ADDITIONAL" },
  { to: "/about", label: "1CNG (About/Company)", icon: Info, section: "ADDITIONAL" },
];
