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
  return null;
}
