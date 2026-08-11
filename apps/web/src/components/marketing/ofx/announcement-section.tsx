import Link from "next/link";
import { ArrowRight, Smartphone } from "@/components/icons/phosphor";
import { MarketingContainer } from "../marketing-container";

export function OfxAnnouncementSection() {
  return (
    <section className="bg-[var(--ofx-paper)]">
      <MarketingContainer className="pb-16 sm:pb-20">
        <div className="grid overflow-hidden rounded-[2rem] bg-[var(--ofx-sage)] lg:grid-cols-2">
          <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-14">
            <p className="ofx-eyebrow">Now live</p>
            <h2 className="ofx-h2 mt-4">
              MoMo prompts have arrived — an easy, secure way for members to
              pay.
            </h2>
            <p className="ofx-body mt-4 max-w-md text-foreground/70">
              Collectors send a prompt, members approve on their own phone, and
              the deposit lands verified in your ledger. No cash. No arguments.
            </p>
            <div className="mt-8">
              <Link href="/register" className="ofx-btn ofx-btn-dark">
                Get started
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>

          <div
            className="relative flex min-h-[280px] items-center justify-center p-8"
            aria-hidden
          >
            <div className="w-64 rounded-[1.75rem] border border-border bg-white p-5 shadow-[0_32px_64px_-32px_rgba(28,27,23,0.4)]">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-[var(--ofx-cream-deep)]">
                  <Smartphone className="h-5 w-5 text-foreground" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Approve payment
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Daily susu · GHS 20.00
                  </p>
                </div>
              </div>
              <div className="mt-5 space-y-2.5">
                <div className="h-2 w-full rounded-full bg-[var(--ofx-cream-deep)]" />
                <div className="h-2 w-3/4 rounded-full bg-[var(--ofx-cream-deep)]" />
              </div>
              <div className="mt-5 rounded-full bg-[var(--ofx-ink)] py-2.5 text-center text-xs font-semibold text-white">
                Confirm with PIN
              </div>
            </div>
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
