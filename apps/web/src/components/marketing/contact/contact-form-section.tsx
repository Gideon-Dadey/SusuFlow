import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faEnvelope,
  faLocationDot,
} from "@fortawesome/free-solid-svg-icons";
import { ContactForm } from "@/components/marketing/contact-form";
import { CONTACT_OFFICE, SUPPORT_EMAIL } from "@/lib/marketing-data";
import { CONTACT_MAP_IMAGE } from "@/lib/brand-assets";
import { MarketingContainer } from "../marketing-container";
import { SectionEyebrow } from "../section-eyebrow";

export function ContactFormSection() {
  return (
    <section id="contact-form" className="scroll-mt-24 afrusan-warm-section">
      <MarketingContainer className="py-16 sm:py-20 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start lg:gap-16 xl:gap-20">
          <div className="min-w-0">
            <SectionEyebrow>Get in touch</SectionEyebrow>
            <h2 className="afrusan-section-title text-balance">
              Need help creating your account?
            </h2>
            <p className="afrusan-body mt-5 max-w-lg text-pretty">
              You can call or email us anytime. Our team helps susu companies
              onboard collectors and run their first verified MoMo collection
              cycle.
            </p>

            <ul className="mt-8 space-y-5">
              <li className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-card">
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    className="h-4 w-4 text-foreground"
                  />
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">Email</p>
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="mt-1 block text-base text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {SUPPORT_EMAIL}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-card">
                  <FontAwesomeIcon
                    icon={faLocationDot}
                    className="h-4 w-4 text-foreground"
                  />
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">Office</p>
                  <p className="mt-1 text-base text-muted-foreground">
                    {CONTACT_OFFICE.addressLines.join(", ")}
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-card">
                  <FontAwesomeIcon
                    icon={faClock}
                    className="h-4 w-4 text-foreground"
                  />
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Response time
                  </p>
                  <p className="mt-1 text-base text-muted-foreground">
                    Within 1 business day
                  </p>
                </div>
              </li>
            </ul>

            <div className="relative mt-10 hidden aspect-[16/10] overflow-hidden rounded-2xl lg:block">
              <Image
                src={CONTACT_MAP_IMAGE}
                alt="Map highlighting SusuFlow office location in Ghana"
                fill
                sizes="(max-width: 1024px) 0px, 40vw"
                className="object-contain object-center"
              />
            </div>
          </div>

          <div className="min-w-0">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8 lg:p-10">
              <p className="mb-6 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Information
              </p>
              <ContactForm />
            </div>
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
