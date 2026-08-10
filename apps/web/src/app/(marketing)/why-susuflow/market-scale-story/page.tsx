import type { Metadata } from "next";
import { HeartHandshake, Radar, Rocket } from "lucide-react";
import { WhyPageTemplate } from "@/components/marketing/ofx/why-page-template";
import { APP_NAME } from "@/lib/marketing-data";

export const metadata: Metadata = {
  title: `Market Scale Story | ${APP_NAME}`,
  description:
    "Scaling from 5 to 50+ collectors across Kumasi & Accra markets.",
};

export default function MarketScaleStoryPage() {
  return (
    <WhyPageTemplate
      accent="lilac"
      hero={{
        title: "From 5 collectors to 50+. Across two cities.",
        lead: "How a leading cooperative scaled from Kumasi to Accra — deploying new agents overnight, tracking daily targets in real time, and safely absorbing a massive influx of new savers.",
        tile: {
          label: "Deposit volume growth",
          value: "+400%",
          caption: "In a matter of months, across Kumasi & Accra",
          badge: "Scaled",
          rows: [
            { label: "Week 1 · Kumasi", value: "5 collectors", status: "Live" },
            {
              label: "Month 3 · Accra",
              value: "32 collectors",
              status: "Live",
            },
            {
              label: "Month 6 · Greater Accra",
              value: "50+ collectors",
              status: "Live",
            },
          ],
        },
      }}
      highlightsHeading={{
        eyebrow: "The playbook",
        title: "How they scaled without breaking",
      }}
      highlights={[
        {
          icon: Rocket,
          title: "Deploy agents in minutes",
          body: "Legacy systems meant days of training and printed logs. With SusuFlow, head office created new profiles in the Control Hub — agents downloaded the app and processed verified deposits on day one.",
        },
        {
          icon: Radar,
          title: "Retain centralized control",
          body: "Distinct collection targets for Kumasi and Accra, segmented reporting, and real-time performance for every new hire — all without leaving headquarters.",
        },
        {
          icon: HeartHandshake,
          title: "Scale trust, not just headcount",
          body: "Instant SMS receipts made wary Accra traders feel secure from the first deposit. Word spread through the markets, and daily volume grew 400% in months.",
        },
      ]}
      sections={[
        {
          eyebrow: "The lesson",
          title: "Growth without the growing pains",
          paragraphs: [
            "Scaling a traditional operation multiplies overhead: more notebooks to audit, more cash in transit, exponentially more reconciliation errors. That friction caps how fast ambitious MFIs can grow.",
            "SusuFlow removes the ceiling. The platform is cloud-based and automated, so the marginal cost of a new field agent is virtually zero. Grow from 5 collectors in one Kumasi market to 50 across Greater Accra — your accounting team won't work a single extra minute.",
          ],
          tile: {
            heading: "Head office · Live view",
            rows: [
              {
                label: "Kumasi Central target",
                value: "GHS 4,200 / 4,000",
                status: "Ahead",
              },
              {
                label: "Accra Makola target",
                value: "GHS 6,850 / 7,500",
                status: "On track",
              },
              {
                label: "New hires this month",
                value: "8 agents",
                status: "Onboarded",
              },
            ],
            footer: "Zero extra reconciliation hours.",
          },
        },
      ]}
      quote={{
        text: "Our partners don't just use SusuFlow to manage the business they have. They use it as the growth engine for the one they want.",
      }}
      related={[
        {
          title: "Field collectors",
          description:
            "Mobile collection tools and live target tracking for market agents.",
          href: "/why-susuflow/field-collectors",
        },
        {
          title: "Susu companies & MFIs",
          description:
            "Purpose-built software for Ghanaian operators to scale safely.",
          href: "/why-susuflow/susu-companies-and-mfis",
        },
        {
          title: "Cashless market collections",
          description:
            "Direct Mobile Money prompts right at the trader's stall.",
          href: "/why-susuflow/cashless-market-collections",
        },
      ]}
    />
  );
}
