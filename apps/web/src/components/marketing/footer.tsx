import Link from "next/link";
import { APP_NAME, CONTACT_OFFICE, SUPPORT_EMAIL } from "@/lib/marketing-data";
import { BrandLockup } from "@/components/marketing/brand-logo";
import { MarketingContainer } from "./marketing-container";

const FOOTER_COLUMNS = [
  {
    heading: "Product",
    links: [
      { label: "MoMo Deposits", href: "/product/accounts-and-payments" },
      { label: "Payouts & Transfers", href: "/product/accounts-and-payments" },
      { label: "Collector App", href: "/product/accounts-and-payments" },
      { label: "Control Hub", href: "/product/manage-and-control" },
      { label: "Ledger & Reports", href: "/product/platform-capabilities" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    heading: "Why SusuFlow",
    links: [
      {
        label: "Susu Companies & MFIs",
        href: "/why-susuflow/susu-companies-and-mfis",
      },
      { label: "Field Collectors", href: "/why-susuflow/field-collectors" },
      {
        label: "Zero Notebook Fraud",
        href: "/why-susuflow/zero-notebook-fraud",
      },
      {
        label: "Gateway Verification",
        href: "/why-susuflow/gateway-verification",
      },
      {
        label: "Bank-Grade Accounting",
        href: "/why-susuflow/bank-grade-accounting",
      },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Blog", href: "/resources" },
      { label: "How It Works", href: "/how-it-works" },
      { label: "Pricing FAQ", href: "/pricing#faq" },
      { label: "Book a Demo", href: "/contact?intent=demo" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Support", href: `mailto:${SUPPORT_EMAIL}` },
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
] as const;

export function MarketingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/70 bg-[var(--ofx-cream)] text-foreground">
      <MarketingContainer className="py-14 sm:py-16">
        <div className="flex flex-col gap-6 border-b border-border/70 pb-10 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="inline-flex items-center">
            <BrandLockup wordmarkClassName="text-xl" />
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/login" className="ofx-btn ofx-btn-light ofx-btn-sm">
              Login
            </Link>
            <Link href="/contact" className="ofx-btn ofx-btn-light ofx-btn-sm">
              Help &amp; Contact
            </Link>
            <Link
              href="/contact?intent=demo"
              className="ofx-btn ofx-btn-dark ofx-btn-sm"
            >
              Book a demo
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-10 pt-10 sm:grid-cols-4 lg:grid-cols-5">
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.heading}>
              <h3 className="text-sm font-semibold text-foreground">
                {column.heading}
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                {column.links.map(({ href, label }) => (
                  <li key={`${href}-${label}`}>
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
          ))}

          <div className="col-span-2 sm:col-span-4 lg:col-span-1">
            <h3 className="text-sm font-semibold text-foreground">Contact</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>{CONTACT_OFFICE.addressLines.join(", ")}</li>
              <li>
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="transition-colors hover:text-foreground"
                >
                  {SUPPORT_EMAIL}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border/70 pt-8">
          <p className="max-w-4xl text-[13px] leading-relaxed text-muted-foreground">
            © {year} {APP_NAME}. {APP_NAME} is a multi-tenant digital savings
            platform for susu companies and microfinance institutions in Ghana.
            Member deposits are processed through licensed payment gateways and
            credited to the ledger only after gateway confirmation. Mobile Money
            is operated by the respective network providers; standard network
            fees may apply. {APP_NAME} is a technology provider and does not
            hold customer funds.
          </p>
          <div className="mt-6 flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>All rights reserved.</p>
            <div className="flex gap-5">
              <Link
                href="/terms"
                className="transition-colors hover:text-foreground"
              >
                Terms of Service
              </Link>
              <Link
                href="/privacy"
                className="transition-colors hover:text-foreground"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </MarketingContainer>
    </footer>
  );
}
