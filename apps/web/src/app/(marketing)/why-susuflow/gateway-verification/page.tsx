import type { Metadata } from "next";
import { Landmark, RefreshCw, ShieldCheck } from "@/components/icons/phosphor";
import { WhyPageTemplate } from "@/components/marketing/ofx/why-page-template";
import { APP_NAME } from "@/lib/marketing-data";

export const metadata: Metadata = {
  title: `100% Gateway Verification | ${APP_NAME}`,
  description:
    "Guarantee every deposit hits the bank before crediting client balances.",
};

export default function GatewayVerificationPage() {
  return (
    <WhyPageTemplate
      accent="sage"
      hero={{
        title: "Every deposit hits the bank first. Every single time.",
        lead: "Guarantee every deposit clears the gateway before a client balance is credited. Absolute verification protects your core capital from transit risk and keeps you regulator-ready.",
        tile: {
          label: "Deposits · Today",
          value: "GHS 12,480.00",
          caption: "142 deposits, all gateway-confirmed",
          badge: "100% verified",
          rows: [
            { label: "MTN MoMo", value: "GHS 8,940.00", status: "Verified" },
            {
              label: "Telecel Cash",
              value: "GHS 2,310.00",
              status: "Verified",
            },
            { label: "AT Money", value: "GHS 1,230.00", status: "Verified" },
          ],
        },
      }}
      highlightsHeading={{
        eyebrow: "Absolute verification",
        title: "Close the risk window for good",
      }}
      highlights={[
        {
          icon: ShieldCheck,
          title: "Secure the source",
          body: "The window between a collector taking cash and depositing it at the branch is dangerously large. Gateway-processed deposits lock the funds in institutional infrastructure the moment the saver confirms.",
        },
        {
          icon: RefreshCw,
          title: "Real-time ledger sync",
          body: "Our API polls telco aggregators directly. The instant a deposit clears, the saver's digital balance updates — so your liquidity metrics always match the funds in your corporate wallets.",
        },
        {
          icon: Landmark,
          title: "Total capital protection",
          body: "Every cedi hits the bank before it exists on your books — protected from transit theft, 'borrowing' or loss. Exactly the standard institutional investors and regulators want to see.",
        },
      ]}
      sections={[
        {
          eyebrow: "The threat",
          title: "Protecting the core capital",
          paragraphs: [
            "One of the greatest existential threats to a scaling MFI is transit risk. When field agents collect thousands of physical cedis a day, your core capital is essentially walking around a crowded market — vulnerable to theft, loss or misappropriation.",
            "SusuFlow integrates deeply with Ghana's leading aggregators like MTN Mobile Money and Telecel Cash, enforcing one strict philosophy: a deposit does not exist on your books until the gateway confirms the funds are locked in your corporate account.",
          ],
          tile: {
            heading: "Deposit lifecycle",
            rows: [
              {
                label: "Saver confirms with PIN",
                value: "09:41",
                status: "Locked",
              },
              {
                label: "Gateway clears funds",
                value: "09:41",
                status: "Verified",
              },
              { label: "Balance credited", value: "09:41", status: "Synced" },
              {
                label: "Cash-in-transit risk",
                value: "Removed entirely",
                status: "GHS 0.00",
              },
            ],
          },
        },
      ]}
      quote={{
        variant: "dark",
        text: "A deposit does not exist on your books until the gateway confirms the funds are locked in your account.",
      }}
      related={[
        {
          title: "Cashless market collections",
          description:
            "Direct Mobile Money prompts right at the trader's stall.",
          href: "/why-susuflow/cashless-market-collections",
        },
        {
          title: "Zero notebook fraud",
          description:
            "How partner MFIs eliminated ledger disputes in 30 days.",
          href: "/why-susuflow/zero-notebook-fraud",
        },
        {
          title: "Bank-grade accounting",
          description:
            "The transparency auditors, partners and regulators demand.",
          href: "/why-susuflow/bank-grade-accounting",
        },
      ]}
    />
  );
}
