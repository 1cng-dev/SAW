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

const threatIntelRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/threat-intel",
  component: ThreatIntelPage,
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
