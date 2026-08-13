import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { BadgeCheck } from "@/components/icons/phosphor";
import { HOW_IT_WORKS_TRADITIONAL_PAINS } from "@/lib/marketing-data";
import { MarketingContainer } from "../marketing-container";

const VERIFIED_FLOW_HIGHLIGHTS = [
  "Gateway verified MoMo deposits",
  "Live balances for every member",
  "Instant digital receipts",
  "Zero cash in collectors' hands",
  "Payouts with approval trails",
  "Audit ready exports on demand",
];

export function HowItWorksTraditionalSection() {
  return (
    <section className="bg-[var(--ofx-paper)]">
      <MarketingContainer className="ofx-section">
        <div className="mx-auto max-w-3xl text-center">
          <p className="ofx-eyebrow">Old way vs new way</p>
          <h2 className="ofx-h2 mt-4">
            Still running susu the old way? You&apos;re not alone.
          </h2>
          <p className="ofx-lead mx-auto mt-5 max-w-2xl">
            {" "}
            Notebooks, cash floats, and WhatsApp receipts work. Until a payment
            is disputed and nobody can prove what was collected. SusuFlow keeps
            the trust and removes the guesswork.{" "}
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:mt-14 lg:grid-cols-2">
          <div className="bg-[var(--ofx-cream-deep)] p-7 sm:p-9">
            <p className="ofx-eyebrow">The old way</p>
            <h3 className="ofx-h3 mt-3">Cash, paper, and crossed fingers</h3>
            <p className="ofx-body mt-3 max-w-md">
              Every one of these slows your company down and leaves room for
              disputes.
            </p>
            <div className="mt-7 flex flex-wrap gap-2.5">
              {HOW_IT_WORKS_TRADITIONAL_PAINS.map(({ label, icon }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-2 bg-white/55 px-4 py-2 text-sm font-medium text-muted-foreground"
                >
                  <FontAwesomeIcon
                    icon={icon}
                    className="h-3.5 w-3.5"
                    aria-hidden
                  />
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-[var(--ofx-sage)] p-7 sm:p-9">
            <p className="ofx-eyebrow">The SusuFlow way</p>
            <h3 className="ofx-h3 mt-3">Verified, from deposit to payout</h3>
            <p className="ofx-body mt-3 max-w-md">
              Every cedi is confirmed by the payment gateway before it touches
              your ledger.
            </p>
            <ul className="mt-7 space-y-3.5">
              {VERIFIED_FLOW_HIGHLIGHTS.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center bg-white">
                    <BadgeCheck
                      className="h-4 w-4 text-foreground"
                      aria-hidden
                    />
                  </span>
                  <span className="text-[15px] font-medium text-foreground">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
