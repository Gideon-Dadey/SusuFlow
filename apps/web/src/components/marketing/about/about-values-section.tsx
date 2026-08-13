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
import { ABOUT_VALUES } from "@/lib/marketing-data";
import { MarketingContainer } from "../marketing-container";
import { MicroLabel } from "../micro-label";
import { PhotoColumns } from "../photo-columns";

const VALUE_MEDIA = [
  {
    image: VALUES_IMAGE_TRUST,
    imageAlt: "A trader completing a susu contribution by Mobile Money",
    icon: Diamond,
  },
  {
    image: VALUES_IMAGE_GHANA,
    imageAlt: "A field collector working a Ghanaian market route",
    icon: Hexagon,
  },
  {
    image: VALUES_IMAGE_TRANSPARENCY,
    imageAlt: "An operations manager reviewing a live susu ledger",
    icon: ShieldCheck,
  },
  {
    image: VALUES_IMAGE_GROWTH,
    imageAlt: "A modern susu office using digital tools",
    icon: Circle,
  },
] as const;

export function AboutValuesSection() {
  return (
    <section id="mission" className="scroll-mt-24">
      <div className="bg-[#f7f7f7] dark:bg-slate-900">
        <MarketingContainer className="py-16 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <MicroLabel className="justify-center">Our values</MicroLabel>
            <h2 className="omnih-h2 mt-4">Four values. Every decision.</h2>
            <p className="omnih-body mx-auto mt-5 max-w-2xl">
              {" "}
              SusuFlow builds on Ghana&apos;s susu heritage. Digital tools that
              strengthen the relationships savers already rely on.{" "}
            </p>
          </div>
        </MarketingContainer>
      </div>
      <PhotoColumns
        items={ABOUT_VALUES.map((value, i) => ({
          title: `${value.title} (${i + 1})`,
          body: value.body,
          image: VALUE_MEDIA[i].image,
          imageAlt: VALUE_MEDIA[i].imageAlt,
          icon: VALUE_MEDIA[i].icon,
        }))}
      />
    </section>
  );
}
