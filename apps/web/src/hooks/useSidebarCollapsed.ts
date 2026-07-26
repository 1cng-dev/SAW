import { useCallback, useEffect, useState } from "react";

const KEY = "sec1cng_sidebar_collapsed";
const EVENT = "sec1cng:sidebar-collapsed-changed";

function read(): boolean {
  return localStorage.getItem(KEY) === "1";
}

export function useSidebarCollapsed() {
  const [collapsed, setCollapsedState] = useState(() => read());

  useEffect(() => {
    const handler = () => setCollapsedState(read());
    window.addEventListener(EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const toggle = useCallback(() => {
    const next = !read();
    localStorage.setItem(KEY, next ? "1" : "0");
    window.dispatchEvent(new CustomEvent(EVENT));
  }, []);

  return { collapsed, toggle };
}
