import { createRootRoute, createRoute, createRouter } from "@tanstack/react-router";
import { z } from "zod";
import { RootLayout } from "./routes/Root";
import { HomePage } from "./routes/Home";
import { CvesListPage } from "./routes/CvesList";
import { CveDetailPage } from "./routes/CveDetail";
import { NewsPage } from "./routes/News";
import { VendorPage } from "./routes/Vendor";
import { TrendingPage } from "./routes/Trending";
import { ThreatReportsPage } from "./routes/ThreatReports";
import { RansomwareTrackerPage } from "./routes/RansomwareTracker";
import { AnnouncementsPage } from "./routes/Announcements";
import { ThreatIntelPage } from "./routes/ThreatIntel";
import { OsintSearchPage } from "./routes/OsintSearch";
import { AssetInventoryPage } from "./routes/AssetInventory";
import { AssetDetailPage } from "./routes/AssetDetail";
import { IncidentsPage } from "./routes/Incidents";
import { IncidentDetailPage } from "./routes/IncidentDetail";
import { PatchManagementPage } from "./routes/PatchManagement";
import { DarkWebMonitoringPage } from "./routes/DarkWebMonitoring";
import { PhishingWatchPage } from "./routes/PhishingWatch";
import { MalwareAnalysisPage } from "./routes/MalwareAnalysis";
import { CompliancePage } from "./routes/Compliance";
import { NotificationSettingsPage } from "./routes/NotificationSettings";
import { TeamManagementPage } from "./routes/TeamManagement";
import { ApiDocsPage } from "./routes/ApiDocs";
import { SearchHistoryPage } from "./routes/SearchHistory";
import { WatchlistPage } from "./routes/Watchlist";
import { AttackMapPage } from "./routes/AttackMap";
import { DigestPage } from "./routes/Digest";
import { AboutPage } from "./routes/About";

const rootRoute = createRootRoute({ component: RootLayout });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const cveSearchSchema = z.object({ search: z.string().optional() });

const cvesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cves",
  validateSearch: cveSearchSchema,
  component: CvesListPage,
});

const cveDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cves/$cveId",
  component: CveDetailPage,
});

const newsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/news",
  component: NewsPage,
});

const vendorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/vendors/$vendorName",
  component: VendorPage,
});

const trendingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/trending",
  component: TrendingPage,
});

const threatReportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/threat-reports",
  component: ThreatReportsPage,
});

const ransomwareTrackerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ransomware-tracker",
  component: RansomwareTrackerPage,
});

const announcementsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/announcements",
  component: AnnouncementsPage,
});

const querySearchSchema = z.object({ q: z.string().optional() });

const threatIntelRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/threat-intel",
  validateSearch: querySearchSchema,
  component: ThreatIntelPage,
});

const assetInventoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/assets",
  component: AssetInventoryPage,
});

const assetDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/assets/$assetId",
  component: AssetDetailPage,
});

const incidentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/incidents",
  component: IncidentsPage,
});

const incidentDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/incidents/$incidentId",
  component: IncidentDetailPage,
});

const patchManagementRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/patch-management",
  component: PatchManagementPage,
});

const darkWebMonitoringRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dark-web-monitoring",
  component: DarkWebMonitoringPage,
});

const phishingWatchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/phishing-watch",
  component: PhishingWatchPage,
});

const malwareAnalysisRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/malware-analysis",
  component: MalwareAnalysisPage,
});

const osintSearchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/osint",
  validateSearch: querySearchSchema,
  component: OsintSearchPage,
});

const complianceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/compliance",
  component: CompliancePage,
});

const notificationSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/notification-settings",
  component: NotificationSettingsPage,
});

const teamManagementRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/team",
  component: TeamManagementPage,
});

const apiDocsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/developer-docs",
  component: ApiDocsPage,
});

const searchHistoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/search-history",
  component: SearchHistoryPage,
});

const watchlistRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/watchlist",
  component: WatchlistPage,
});

const attackMapRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/attack-map",
  component: AttackMapPage,
});

const digestRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/digest",
  component: DigestPage,
});

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/about",
  component: AboutPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  cvesRoute,
  cveDetailRoute,
  newsRoute,
  vendorRoute,
  trendingRoute,
  threatReportsRoute,
  ransomwareTrackerRoute,
  announcementsRoute,
  threatIntelRoute,
  osintSearchRoute,
  assetInventoryRoute,
  assetDetailRoute,
  incidentsRoute,
  incidentDetailRoute,
  patchManagementRoute,
  darkWebMonitoringRoute,
  phishingWatchRoute,
  malwareAnalysisRoute,
  complianceRoute,
  notificationSettingsRoute,
  teamManagementRoute,
  apiDocsRoute,
  searchHistoryRoute,
  watchlistRoute,
  attackMapRoute,
  digestRoute,
  aboutRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
