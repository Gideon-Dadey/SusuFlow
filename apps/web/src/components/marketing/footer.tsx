"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  APP_NAME,
  CONTACT_OFFICE,
  FOOTER_LINKS,
  NAV_LINKS,
  SUPPORT_EMAIL,
} from "@/lib/marketing-data";
import { BrandLockup } from "@/components/marketing/brand-logo";
import { MarketingContainer } from "./marketing-container";

function GhanaClock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const format = () => {
      setTime(
        new Intl.DateTimeFormat("en-GB", {
          timeZone: "Africa/Accra",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).format(new Date()),
      );
    };
    format();
    const interval = window.setInterval(format, 1000);
    return () => window.clearInterval(interval);
  }, []);

  return <span className="tabular-nums">{time || "—"}</span>;
}

export function MarketingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/60 bg-background text-foreground">
      <MarketingContainer className="py-14 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4 space-y-5">
            <Link href="/" className="inline-flex items-center">
              <BrandLockup wordmarkClassName="text-xl" />
            </Link>
            <p className="max-w-sm text-base leading-relaxed text-muted-foreground">
              Contact us to explore our platform and pricing plans for your susu
              company.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full border border-foreground px-6 py-2.5 text-sm font-medium transition-colors hover:bg-foreground hover:text-background"
            >
              Let&apos;s chat
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-8">
            <div>
              <h3 className="text-sm font-medium text-foreground">Navigate</h3>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/"
                    className="transition-colors hover:text-foreground"
                  >
                    Home
                  </Link>
                </li>
                {NAV_LINKS.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="transition-colors hover:text-foreground"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-medium text-foreground">Product</h3>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                {FOOTER_LINKS.product.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="transition-colors hover:text-foreground"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <h3 className="text-sm font-medium text-foreground">Contact</h3>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li>
                  <p className="text-foreground">Address</p>
                  <p>{CONTACT_OFFICE.addressLines.join(", ")}</p>
                </li>
                <li>
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="transition-colors hover:text-foreground"
                  >
                    {SUPPORT_EMAIL}
                  </a>
                </li>
                <li>
                  <p className="text-foreground">Ghana</p>
                  <GhanaClock />
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border/60 pt-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {APP_NAME}. All rights reserved.
          </p>
          <div className="flex gap-5">
            {FOOTER_LINKS.legal.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="transition-colors hover:text-foreground"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </MarketingContainer>
    </footer>
  );
}
