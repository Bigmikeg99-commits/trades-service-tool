"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

type Theme = "light" | "dark" | "system";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme") as Theme | null;
    const initial = stored || "system";
    setTheme(initial);
    // Ensure class is applied on client mount (defensive; script handles most first-paint cases)
    applyTheme(initial);
  }, []);

  function applyTheme(t: Theme) {
    const root = document.documentElement;
    if (t === "dark") {
      root.classList.add("dark");
    } else if (t === "light") {
      root.classList.remove("dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  }

  // When on "system", listen for OS preference changes and update the class live.
  // (The initial script handles first paint; this keeps it respecting system dynamically.)
  useEffect(() => {
    if (theme !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const applySystem = () => {
      applyTheme("system");
    };

    // Apply once in case (e.g. mount timing)
    applySystem();

    media.addEventListener("change", applySystem);
    return () => media.removeEventListener("change", applySystem);
  }, [theme]);

  const updateTheme = (newTheme: Theme) => {
    applyTheme(newTheme);

    if (newTheme === "system") {
      localStorage.removeItem("theme");
    } else {
      localStorage.setItem("theme", newTheme);
    }

    setTheme(newTheme);
  };

  if (!mounted) {
    return <div className="h-8 w-8" />;
  }

  return (
    <div className="flex items-center rounded-lg border border-zinc-200 bg-white p-1 dark:border-zinc-700 dark:bg-zinc-950">
      <button
        onClick={() => updateTheme("light")}
        className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
          theme === "light"
            ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
            : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
        }`}
        aria-label="Light mode"
        title="Light mode"
      >
        <Sun className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => updateTheme("dark")}
        className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
          theme === "dark"
            ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
            : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
        }`}
        aria-label="Dark mode"
        title="Dark mode"
      >
        <Moon className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => updateTheme("system")}
        className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
          theme === "system"
            ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
            : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
        }`}
        aria-label="System preference"
        title="System preference"
      >
        <Monitor className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}