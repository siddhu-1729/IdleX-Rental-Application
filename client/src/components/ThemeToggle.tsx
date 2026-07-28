"use client";

import React from "react";
import { useTheme } from "../lib/theme";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggle = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const setSystem = () => setTheme("system");

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center space-x-2">
      <button
        onClick={toggle}
        aria-label="Toggle theme"
        className="p-2 rounded-md bg-card text-sm shadow-md hover:opacity-90 transition"
        title="Toggle light / dark"
      >
        {theme === "dark" ? "🌙" : "☀️"}
      </button>

      <button
        onClick={setSystem}
        aria-label="Use system theme"
        title="Use system preference"
        className="p-2 rounded-md bg-card text-sm shadow-md hover:opacity-90 transition"
      >
        System
      </button>
    </div>
  );
}
