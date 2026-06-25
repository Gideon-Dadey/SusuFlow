import { createContext, ReactNode, useContext, useMemo } from "react";
import { useThemeStore } from "@/stores/theme.store";
import {
  darkColors,
  lightColors,
  radius,
  shadows,
  spacing,
  surfaceRadius,
  ThemeColors,
  typography,
} from "@/theme/tokens";

export interface AppTheme {
  colors: ThemeColors;
  radius: typeof radius;
  surfaceRadius: typeof surfaceRadius;
  spacing: typeof spacing;
  typography: typeof typography;
  shadows: typeof shadows;
  isDark: boolean;
}

const ThemeContext = createContext<AppTheme | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const colorScheme = useThemeStore((s) => s.colorScheme);

  const theme = useMemo<AppTheme>(
    () => ({
      colors: colorScheme === "dark" ? darkColors : lightColors,
      radius,
      surfaceRadius,
      spacing,
      typography,
      shadows,
      isDark: colorScheme === "dark",
    }),
    [colorScheme],
  );

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): AppTheme {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      colors: lightColors,
      radius,
      surfaceRadius,
      spacing,
      typography,
      shadows,
      isDark: false,
    };
  }
  return ctx;
}
