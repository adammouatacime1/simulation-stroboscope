import { useEffect, useState } from "react";

export type Theme = "light" | "dark";
const preference = () => {
  try {
    const value = localStorage.getItem("stroboscope-theme");
    if (value === "light" || value === "dark") return value;
  } catch {
    /* Storage may be disabled. */
  }
  return null;
};

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(
    () =>
      preference() ??
      (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"),
  );
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "light" ? "#F5F5F7" : "#0B0B0D");
  }, [theme]);
  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    const update = () => {
      if (!preference()) setTheme(media.matches ? "dark" : "light");
    };
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  function toggle() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    try {
      localStorage.setItem("stroboscope-theme", next);
    } catch {
      /* The theme still works for this session. */
    }
  }
  return { theme, toggle };
}
