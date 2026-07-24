import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Search, ShieldHalf } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const NAV_LINKS = [
  { to: "/cves", label: "CVE Database" },
  { to: "/news", label: "News" },
  { to: "/trending", label: "Trending" },
] as const;

export function Navbar() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    navigate({ to: "/cves", search: { search: search || undefined } });
  }

  return (
    <header className="sticky top-0 z-10 border-b border-surface-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-slate-100">
          <ShieldHalf className="h-5 w-5 text-blue-400" />
          <span className="font-semibold tracking-tight">Sec-1CNG</span>
        </Link>

        <nav className="hidden items-center gap-4 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm text-slate-400 transition hover:text-slate-100 [&.active]:text-slate-100"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <form onSubmit={handleSubmit} className="ml-auto flex max-w-sm flex-1 items-center">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search CVE ID, vendor, keyword…"
              className="w-full rounded-md border border-surface-border bg-surface-raised py-1.5 pl-8 pr-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </form>

        <ThemeToggle />
      </div>
    </header>
  );
}
