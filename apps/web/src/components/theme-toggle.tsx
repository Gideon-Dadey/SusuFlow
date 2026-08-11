"use client";

import { useEffect, useRef, useState } from "react";
import { Monitor, Moon, Sun } from "@/components/icons/phosphor";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

type ThemeToggleProps = {
  className?: string;
  onDark?: boolean;
  iconOnly?: boolean;
};

export function ThemeToggle({ className, onDark, iconOnly }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!mounted) {
    return <div className={cn("size-9 shrink-0", className)} aria-hidden />;
  }

  const active = theme ?? "light";
  const isDark = resolvedTheme === "dark";
  const ActiveIcon = isDark ? Moon : Sun;

  if (iconOnly) {
    return (
      <button
        type="button"
        className={cn(
          "inline-flex size-9 items-center justify-center transition-colors",
          onDark
            ? "text-white/90 hover:bg-white/10 hover:text-white"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
          className,
        )}
        aria-label="Toggle theme"
        onClick={() => setTheme(isDark ? "light" : "dark")}
      >
        <ActiveIcon className="h-[1.125rem] w-[1.125rem]" />
      </button>
    );
  }

  const MenuActiveIcon =
    active === "dark" || (active === "system" && resolvedTheme === "dark")
      ? Moon
      : Sun;

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        className={cn(
          "inline-flex size-9 items-center justify-center transition-colors",
          onDark
            ? "text-white/90 hover:bg-white/10 hover:text-white"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
        aria-label="Toggle theme"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <MenuActiveIcon className="h-[1.125rem] w-[1.125rem]" />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-[300] mt-2 min-w-[9.5rem] overflow-hidden rounded-lg border border-border bg-popover p-1 shadow-elevated"
        >
          {OPTIONS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              role="menuitemradio"
              aria-checked={active === value}
              className={cn(
                "flex w-full items-center gap-2 px-2.5 py-2 text-left text-sm transition-colors",
                active === value
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
              )}
              onClick={() => {
                setTheme(value);
                setOpen(false);
              }}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
