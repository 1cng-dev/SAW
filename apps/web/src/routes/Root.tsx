import { Outlet } from "@tanstack/react-router";
import { Navbar } from "../components/layout/Navbar";

export function RootLayout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
