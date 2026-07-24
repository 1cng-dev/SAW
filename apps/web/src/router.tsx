import { createRootRoute, createRoute, createRouter } from "@tanstack/react-router";
import { z } from "zod";
import { RootLayout } from "./routes/Root";
import { HomePage } from "./routes/Home";
import { CvesListPage } from "./routes/CvesList";
import { CveDetailPage } from "./routes/CveDetail";
import { NewsPage } from "./routes/News";
import { VendorPage } from "./routes/Vendor";
import { TrendingPage } from "./routes/Trending";

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

const routeTree = rootRoute.addChildren([
  indexRoute,
  cvesRoute,
  cveDetailRoute,
  newsRoute,
  vendorRoute,
  trendingRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
