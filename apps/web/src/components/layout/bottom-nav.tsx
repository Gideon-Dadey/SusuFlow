"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { cn, getPortalFromPathname } from "@/lib/utils";
import { customerLinks, collectorLinks, staffLinks } from "@/lib/dashboard-nav";

const COLLECTOR_BOTTOM_NAV = [
  collectorLinks[0],
  collectorLinks[1],
  collectorLinks[2],
  collectorLinks[4],
];

export function BottomNav() {
  const pathname = usePathname();
  const portal = getPortalFromPathname(pathname);

  const nav =
    portal === "staff"
      ? staffLinks.slice(0, 4)
      : portal === "collector"
        ? COLLECTOR_BOTTOM_NAV
        : customerLinks;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md safe-bottom md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {nav.map(({ href, label, icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-w-[64px] flex-col items-center gap-1 rounded-none px-3 py-2 transition-colors",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <FontAwesomeIcon icon={icon} className="h-5 w-5" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
