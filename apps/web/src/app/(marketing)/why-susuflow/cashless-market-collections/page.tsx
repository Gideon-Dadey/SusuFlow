import type { Metadata } from "next";
import { Send, Shield, Zap } from "@/components/icons/phosphor";
import { WhyPageTemplate } from "@/components/marketing/ofx/why-page-template";
import { APP_NAME } from "@/lib/marketing-data";

export const metadata: Metadata = {
  title: `Cashless Market Collections | ${APP_NAME}`,
  description: "Direct Mobile Money wallet prompts right at the trader stall.",
};

export default function CashlessMarketCollectionsPage() {
  return (
    <WhyPageTemplate
      accent="sand"
      hero={{
        title: "Collections without cash. Right at the stall.",
        lead: "Direct Mobile Money prompts at the trader's stall. The collector initiates the deposit in the app, the saver enters their PIN on their own phone, and the transaction lands in your ledger instantly.",
        tile: {
          label: "MoMo prompt · Ama A.",
          value: "GHS 30.00",
          caption: "Fully cashless, settled in seconds",
          badge: "Cashless",
          rows: [
            {
              label: "Prompt pushed to wallet",
              value: "10:12",
              status: "Sent",
            },
            { label: "Saver enters PIN", value: "10:12", status: "Confirmed" },
            {
              label: "Settled to merchant account",
              value: "10:12",
              status: "Instant",
            },
          ],
        },
      }}
      highlightsHeading={{
        eyebrow: "Cashless by design",
        title: "No cash. No risk. No waiting.",
      }}
      highlights={[
        {
          icon: Send,
          title: "The direct prompt push",
          body: "Deep telco API integration pushes prompts straight to a trader's mobile money wallet. The collector enters the amount; the saver's phone lights up asking for their PIN. Fast, seamless, cashless.",
        },
        {
          icon: Shield,
          title: "Unmatched physical security",
          body: "Carrying thousands of cedis through crowded markets makes collectors prime targets. Cashless collections protect your capital. And, crucially, the physical safety of your field teams.",
        },
        {
          icon: Zap,
          title: "Instant liquidity settlement",
          body: "The moment a trader enters their PIN, funds move to your corporate merchant account. Re deploy capital into micro loans immediately instead of waiting for end of day bank deposits.",
        },
      ]}
      sections={[
        {
          eyebrow: "The shift",
          title: "The future of the African market is digital",
          paragraphs: [
            "The informal sector drives the Ghanaian economy, but its reliance on physical cash creates real danger for collectors and hours of lost liquidity for the MFI waiting on end of day branch deposits.",
            "SusuFlow leverages the explosive growth of Mobile Money in West Africa to remove cash from the collection cycle entirely. Every transaction is a direct digital exchange between the saver's wallet and your corporate account.",
            "The shift doesn't just improve security. It accelerates the velocity of your capital: funds settle instantly, so you disburse loans faster, earn interest sooner and serve clients with unprecedented speed.",
          ],
          tile: {
            heading: "Old day vs. Cashless day",
            rows: [
              {
                label: "Cash carried by agents",
                value: "GHS 0.00",
                status: "Was GHS 9,400",
              },
              {
                label: "Funds available for loans",
                value: "Immediately",
                status: "Was next day",
              },
              { label: "Transit risk", value: "None", status: "Eliminated" },
            ],
          },
        },
      ]}
      quote={{
        variant: "dark",
        text: "When funds settle instantly, you disburse loans faster, earn interest sooner, and serve clients with unprecedented speed.",
      }}
      related={[
        {
          title: "100% gateway verification",
          description:
            "Every deposit hits the bank before it touches a client balance.",
          href: "/why-susuflow/gateway-verification",
        },
        {
          title: "Field collectors",
          description:
            "Mobile collection tools and live target tracking for market agents.",
          href: "/why-susuflow/field-collectors",
        },
        {
          title: "Susu companies & MFIs",
          description:
            "Purpose built software for Ghanaian operators to scale safely.",
          href: "/why-susuflow/susu-companies-and-mfis",
        },
      ]}
    />
  );
}
