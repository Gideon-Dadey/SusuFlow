import {
  Circle,
  Diamond,
  Hexagon,
  ShieldCheck,
} from "@/components/icons/phosphor";
import {
  VALUES_IMAGE_GHANA,
  VALUES_IMAGE_GROWTH,
  VALUES_IMAGE_TRANSPARENCY,
  VALUES_IMAGE_TRUST,
} from "@/lib/brand-assets";
import { HOW_IT_WORKS_STEPS } from "@/lib/marketing-data";
import { MarketingContainer } from "../marketing-container";
import { MicroLabel } from "../micro-label";
import { PhotoColumns } from "../photo-columns";

const STEP_MEDIA = [
  {
    image: VALUES_IMAGE_TRANSPARENCY,
    imageAlt: "Setting up a susu company on SusuFlow",
    icon: Diamond,
  },
  {
    image: VALUES_IMAGE_GHANA,
    imageAlt: "Members joining a susu company digitally",
    icon: Hexagon,
  },
  {
    image: VALUES_IMAGE_TRUST,
    imageAlt: "A member depositing via Mobile Money",
    icon: Circle,
  },
  {
    image: VALUES_IMAGE_GROWTH,
    imageAlt: "Staff reviewing verified deposits and payouts",
    icon: ShieldCheck,
  },
] as const;

export function HowItWorksStepsSection() {
  return (
    <section>
      <div className="bg-[#f7f7f7] dark:bg-slate-900">
        <MarketingContainer className="py-16 md:py-28">
          <div className="max-w-2xl">
            <MicroLabel>The digital path</MicroLabel>
            <h2 className="omnih-h2 mt-4">
              Four steps from signup to verified savings.
            </h2>
            <p className="omnih-body mt-5">
              {" "}
              Simple for members. Accountable for management. The flow is the
              same whether you run one collector team or a multi branch
              company.{" "}
            </p>
          </div>
        </MarketingContainer>
      </div>
      <PhotoColumns
        items={HOW_IT_WORKS_STEPS.map((step, i) => ({
          title: `${step.title} (${i + 1})`,
          body: step.description,
          image: STEP_MEDIA[i].image,
          imageAlt: STEP_MEDIA[i].imageAlt,
          icon: STEP_MEDIA[i].icon,
        }))}
      />
    </section>
  );
}
