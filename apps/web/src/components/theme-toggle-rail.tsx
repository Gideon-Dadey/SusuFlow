"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const SHOW_AFTER_SCROLL = 420;

type ThemeToggleRailProps = {
  showAfter?: number;
  className?: string;
};

export function ThemeToggleRail({
  showAfter = SHOW_AFTER_SCROLL,
  className,
}: ThemeToggleRailProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > showAfter);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [showAfter]);

  if (!mounted) {
    return null;
  }

  const isDark = resolvedTheme === "dark";

  return createPortal(
    <aside
      aria-label="Theme"
      className={cn(
        "theme-toggle-rail fixed z-[175]",
        visible ? "theme-toggle-rail--visible" : "theme-toggle-rail--hidden",
        className,
      )}
    >
      <div className="flex w-9 flex-col items-center gap-0.5 rounded-full border border-border/80 bg-card/95 p-1 shadow-[0_4px_16px_rgb(15_23_42_/_0.1)] backdrop-blur-sm sm:w-8 sm:p-0.5 dark:border-secondary/30 dark:shadow-[0_4px_16px_rgb(0_0_0_/_0.3)]">
        <ThemeRailOption
          label="Dark theme"
          active={isDark}
          onClick={() => setTheme("dark")}
          icon={<Moon className="h-3 w-3 sm:h-2.5 sm:w-2.5" strokeWidth={2} />}
        />
        <ThemeRailOption
          label="Light theme"
          active={!isDark}
          onClick={() => setTheme("light")}
          icon={<Sun className="h-3 w-3 sm:h-2.5 sm:w-2.5" strokeWidth={2} />}
        />
      </div>
    </aside>,
    document.body,
  );
}

function ThemeRailOption({
  label,
  active,
  onClick,
  icon,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={`${label} theme`}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "flex size-8 items-center justify-center transition-colors sm:size-7",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
      )}
    >
      {icon}
    </button>
  );
}
