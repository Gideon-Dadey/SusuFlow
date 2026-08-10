import type { Metadata } from "next";
import { BadgeCheck, Smartphone, Target } from "lucide-react";
import { WhyPageTemplate } from "@/components/marketing/ofx/why-page-template";
import { APP_NAME } from "@/lib/marketing-data";

export const metadata: Metadata = {
  title: `Field Collectors | ${APP_NAME}`,
  description:
    "Empower market agents with mobile collection tools & live tracking.",
};

export default function FieldCollectorsPage() {
  return (
    <WhyPageTemplate
      accent="sky"
      hero={{
        title: "Give every collector a bank in their pocket.",
        lead: "Empower market agents with mobile collection tools and live tracking. Collectors pull up client profiles, process MoMo deposits and track daily targets — no easily-lost notebooks required.",
        tile: {
          label: "My target · Today",
          value: "GHS 1,850 / 2,000",
          caption: "92% collected · 3 stops remaining",
          badge: "On track",
          rows: [
            {
              label: "Abena Osei",
              value: "Daily susu · GHS 50.00",
              status: "Verified",
            },
            {
              label: "Kwame Mensah",
              value: "Market group · GHS 120.00",
              status: "Verified",
            },
            {
              label: "Ama Agyei",
              value: "Weekly susu · GHS 30.00",
              status: "Prompt sent",
              statusTone: "muted",
            },
          ],
        },
      }}
      highlightsHeading={{
        eyebrow: "For the frontlines",
        title: "Faster rounds. Safer agents. Happier savers.",
      }}
      highlights={[
        {
          icon: Smartphone,
          title: "A bank in your pocket",
          body: "Any smartphone becomes a fully-fledged point-of-sale terminal for microfinance. Agents pull up profiles, review savings goals and fire off MoMo prompts — no cash, no paper receipts.",
        },
        {
          icon: Target,
          title: "Real-time target tracking",
          body: "A live dashboard shows every collector their daily, weekly and monthly targets. Instant visual feedback drives higher collection rates and healthy competition across teams.",
        },
        {
          icon: BadgeCheck,
          title: "Unshakeable client trust",
          body: "Savers get an instant, un-spoofable SMS the second a deposit clears. No more 'he-said, she-said' over notebook entries — your agents become the most trusted collectors in the market.",
        },
      ]}
      sections={[
        {
          eyebrow: "The upgrade",
          title: "Empowering the frontlines",
          paragraphs: [
            "Field collectors are the lifeblood of any susu operation — yet they've been burdened for too long with weather-prone paper notebooks and the security risk of carrying bulk cash through crowded markets.",
            "With enterprise-grade technology in the palm of their hands, an agent serves twice as many clients in the same time. No robbery worries, no math errors, no angry savers at month-end — just respected, digitized financial representatives for their communities.",
          ],
          tile: {
            heading: "A collector's day",
            rows: [
              {
                label: "Clients served",
                value: "46 of 48",
                status: "2x faster",
              },
              { label: "Cash carried", value: "GHS 0.00", status: "Cashless" },
              { label: "Receipts issued", value: "46 SMS", status: "Instant" },
              { label: "Month-end disputes", value: "0", status: "Resolved" },
            ],
          },
        },
      ]}
      quote={{
        text: "Give field agents enterprise-grade technology and they work faster, safer, and with far greater confidence.",
      }}
      related={[
        {
          title: "Cashless market collections",
          description:
            "Direct Mobile Money prompts right at the trader's stall.",
          href: "/why-susuflow/cashless-market-collections",
        },
        {
          title: "Market scale story",
          description:
            "Scaling from 5 to 50+ collectors across Kumasi and Accra.",
          href: "/why-susuflow/market-scale-story",
        },
        {
          title: "Zero notebook fraud",
          description:
            "How partner MFIs eliminated ledger disputes in 30 days.",
          href: "/why-susuflow/zero-notebook-fraud",
        },
      ]}
    />
  );
}
