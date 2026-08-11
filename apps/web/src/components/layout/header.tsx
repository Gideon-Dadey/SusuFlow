"use client";

import { useAuthStore } from "@/stores/auth.store";
import { getInitials } from "@/lib/utils";
import { LogOut } from "@/components/icons/phosphor";
import { useRouter } from "next/navigation";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        <div>
          {title ? (
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          ) : null}
          {subtitle ? (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-foreground">
              {user?.firstName} {user?.lastName}
            </p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white text-sm font-medium">
            {getInitials(user?.firstName, user?.lastName)}
          </div>
          <button
            onClick={handleLogout}
            className="hidden md:flex items-center justify-center h-9 w-9 text-muted-foreground hover:bg-muted"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
