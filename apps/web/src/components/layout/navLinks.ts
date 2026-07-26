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
  Server,
  Siren,
  Wrench,
  Eye,
  ShieldAlert,
  Fingerprint,
  ClipboardCheck,
  Code2,
  Bell,
  Users,
  History,
} from "lucide-react";

export type BadgeKey = "watchlist" | "openIncidents" | "overduePatches";

export interface NavLinkDef {
  to: string;
  label: string;
  icon: LucideIcon;
  section?: "MAIN" | "ADDITIONAL";
  badgeKey?: BadgeKey;
}

export const NAV_LINKS: NavLinkDef[] = [
  // MAIN
  { to: "/", label: "Dashboard", icon: LayoutDashboard, section: "MAIN" },
  { to: "/cves", label: "CVE Database", icon: ShieldHalf, section: "MAIN" },
  { to: "/news", label: "Cyber News", icon: Newspaper, section: "MAIN" },
  { to: "/threat-reports", label: "Threat Reports", icon: FileText, section: "MAIN" },
  { to: "/ransomware-tracker", label: "Ransomware Group Tracker", icon: Skull, section: "MAIN" },
  { to: "/announcements", label: "1CNG Security Announcement", icon: Megaphone, section: "MAIN" },
  { to: "/assets", label: "Asset Inventory", icon: Server, section: "MAIN" },
  { to: "/incidents", label: "Incident Response", icon: Siren, section: "MAIN", badgeKey: "openIncidents" },
  { to: "/patch-management", label: "Patch Management", icon: Wrench, section: "MAIN", badgeKey: "overduePatches" },
  { to: "/dark-web-monitoring", label: "Dark Web Monitoring", icon: Eye, section: "MAIN" },
  { to: "/phishing-watch", label: "Phishing / Domain Alert", icon: ShieldAlert, section: "MAIN" },

  // ADDITIONAL
  { to: "/threat-intel", label: "Threat Intel / IOC Lookup", icon: Search, section: "ADDITIONAL" },
  { to: "/osint", label: "OSINT / Network Search", icon: Radar, section: "ADDITIONAL" },
  { to: "/watchlist", label: "CVE Watchlist", icon: Star, section: "ADDITIONAL", badgeKey: "watchlist" },
  { to: "/attack-map", label: "Global Attack/Advisory Map", icon: Globe, section: "ADDITIONAL" },
  { to: "/digest", label: "Weekly Security Digest", icon: FileDown, section: "ADDITIONAL" },
  { to: "/malware-analysis", label: "Malware / Hash Analysis", icon: Fingerprint, section: "ADDITIONAL" },
  { to: "/compliance", label: "Compliance Checklist", icon: ClipboardCheck, section: "ADDITIONAL" },
  { to: "/developer-docs", label: "API Access / Docs", icon: Code2, section: "ADDITIONAL" },
  { to: "/notification-settings", label: "Notification Settings", icon: Bell, section: "ADDITIONAL" },
  { to: "/team", label: "Team / User Management", icon: Users, section: "ADDITIONAL" },
  { to: "/search-history", label: "Search History", icon: History, section: "ADDITIONAL" },
  { to: "/about", label: "1CNG (About/Company)", icon: Info, section: "ADDITIONAL" },
];
