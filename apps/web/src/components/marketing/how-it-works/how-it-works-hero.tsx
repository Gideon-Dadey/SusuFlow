import { HOW_IT_WORKS_GHANIAN_MARKET } from "@/lib/brand-assets";
import { SplitPreview } from "../split-preview";

export function HowItWorksHero() {
  return (
    <SplitPreview
      eyebrow="How it works"
      title="From notebooks to verified MoMo."
      lead="Keep your collectors, keep your community trust. SusuFlow moves the money onto a verified digital ledger. So every cedi is confirmed, traceable, and dispute proof."
      image={HOW_IT_WORKS_GHANIAN_MARKET}
      imageAlt="A Ghanaian market stall where susu contributions are collected digitally"
      primaryCta={{ label: "Get started for free", href: "/register" }}
      secondaryCta={{ label: "View pricing", href: "/pricing" }}
    />
  );
}
