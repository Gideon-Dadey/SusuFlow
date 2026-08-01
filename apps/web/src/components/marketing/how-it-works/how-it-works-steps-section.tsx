import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { HOW_IT_WORKS_STEPS } from "@/lib/marketing-data";
import { MarketingContainer } from "../marketing-container";

export function HowItWorksStepsSection() {
  return (
    <section className="bg-white dark:bg-background">
      <MarketingContainer className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-2xl text-left">
          <p className="text-[17px] font-medium text-muted-foreground">
            The digital path
          </p>
          <h2 className="mt-3 text-balance text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl lg:text-[2rem]">
            Four steps from signup to verified savings
          </h2>
          <p className="mt-5 text-pretty text-[17px] leading-relaxed text-muted-foreground">
            Whether you run a formal susu company or a growing collector
            network, the flow is the same. Simple for members. Accountable for
            management.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:mt-12 lg:gap-8">
          {HOW_IT_WORKS_STEPS.map(({ step, title, description, icon }) => {
            return (
              <article
                key={step}
                className="rounded-none border border-border/70 bg-card p-6 shadow-[0_8px_30px_rgba(15,23,42,0.05)] sm:p-8 dark:border-border dark:shadow-none"
              >
                <div className="flex items-start gap-4 sm:gap-5">
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-none bg-[#f3f4f6] dark:bg-muted">
                    <FontAwesomeIcon
                      icon={icon}
                      className="h-6 w-6 text-foreground sm:h-7 sm:w-7"
                      aria-hidden
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[17px] font-bold text-secondary">
                      {step}
                    </span>
                    <h3 className="mt-1 text-lg font-bold tracking-tight text-foreground">
                      {title}
                    </h3>
                    <p className="mt-2 text-[17px] leading-relaxed text-muted-foreground sm:text-[17px]">
                      {description}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </MarketingContainer>
    </section>
  );
}
