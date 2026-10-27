import { useEffect, useState } from "react";
import { FaMoon, FaSun } from "react-icons/fa";

const THEME_KEY = "cravings_theme";

function readTheme() {
  try {
    return localStorage.getItem(THEME_KEY) === "dark";
  } catch {
    return false;
  }
}

export default function ThemeToggle({ className = "" }) {
  const [isDark, setIsDark] = useState(readTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("app-dark", isDark);
    root.style.colorScheme = isDark ? "dark" : "light";
    try {
      localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
    } catch {
      // The theme still works for this session when storage is unavailable.
    }
  }, [isDark]);

  return (
    <button
      type="button"
      onClick={() => setIsDark((current) => !current)}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 text-sm font-semibold text-white transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300 ${className}`}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      aria-pressed={isDark}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {isDark ? <FaSun aria-hidden="true" /> : <FaMoon aria-hidden="true" />}
      <span>{isDark ? "Light mode" : "Dark mode"}</span>
    </button>
  );
}
