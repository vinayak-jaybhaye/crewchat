"use client";

import { useThemeStore } from "@/store/theme.store";
import { useEffect } from "react";

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
  }, []);

  return <>{children}</>;
}
