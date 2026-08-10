import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { HOW_IT_WORKS_STEPS } from "@/lib/marketing-data";
import { MarketingContainer } from "../marketing-container";

const STEP_TILE_COLORS = [
  "var(--ofx-sage)",
  "var(--ofx-sky)",
  "var(--ofx-sand)",
  "var(--ofx-lilac)",
];

export function HowItWorksStepsSection() {
  return (
    <section className="bg-[var(--ofx-cream)]">
      <MarketingContainer className="ofx-section">
        <div className="max-w-2xl">
          <p className="ofx-eyebrow">The digital path</p>
          <h2 className="ofx-h2 mt-4">
            Four steps from signup to verified savings.
          </h2>
          <p className="ofx-lead mt-5">
            Simple for members. Accountable for management. The flow is the same
            whether you run one collector team or a multi-branch company.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:mt-14">
          {HOW_IT_WORKS_STEPS.map(({ step, title, description, icon }, i) => (
            <article
              key={step}
              className="flex flex-col rounded-[1.75rem] p-7 sm:p-9"
              style={{ backgroundColor: STEP_TILE_COLORS[i % 4] }}
            >
              <div className="flex items-start justify-between">
                <span className="text-5xl font-medium tracking-tighter text-foreground/25 sm:text-6xl">
                  {step}
                </span>
                <span className="flex size-11 items-center justify-center rounded-full bg-white">
                  <FontAwesomeIcon
                    icon={icon}
                    className="h-5 w-5 text-foreground"
                    aria-hidden
                  />
                </span>
              </div>
              <h3 className="ofx-h3 mt-8">{title}</h3>
              <p className="ofx-body mt-3">{description}</p>
            </article>
          ))}
        </div>
      </MarketingContainer>
    </section>
  );
}
