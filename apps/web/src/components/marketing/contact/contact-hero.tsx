import Link from "next/link";
import { ArrowRight, Mail, MapPin, MessageSquare } from "lucide-react";
import { CONTACT_OFFICE, SUPPORT_EMAIL } from "@/lib/marketing-data";
import { MarketingContainer } from "../marketing-container";
import { SectionEyebrow } from "../section-eyebrow";

export function ContactHero() {
  return (
    <section className="bg-background">
      <MarketingContainer className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <SectionEyebrow className="text-center">Contact</SectionEyebrow>
          <h1 className="afrusan-hero-title text-balance !text-4xl sm:!text-5xl lg:!text-[3.5rem]">
            {CONTACT_OFFICE.headline}
          </h1>
          <p className="afrusan-body mx-auto mt-5 max-w-2xl text-balance">
            Contact us to learn more about our platform, pricing plans, and
            onboarding for your susu company. Share your details and any
            questions, and a member of our team will be in touch.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-3 sm:gap-5">
          <div className="afrusan-card p-6 text-center sm:text-left">
            <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#c6e5df]/40 sm:mx-0">
              <MapPin className="h-5 w-5 text-foreground" aria-hidden />
            </div>
            <p className="text-sm font-medium text-foreground">Address</p>
            <address className="mt-2 not-italic text-sm leading-relaxed text-muted-foreground">
              {CONTACT_OFFICE.addressLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
          </div>

          <div className="afrusan-card p-6 text-center sm:text-left">
            <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#c6e5df]/40 sm:mx-0">
              <Mail className="h-5 w-5 text-foreground" aria-hidden />
            </div>
            <p className="text-sm font-medium text-foreground">Email</p>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="mt-2 block text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {SUPPORT_EMAIL}
            </a>
          </div>

          <div className="afrusan-card p-6 text-center sm:text-left">
            <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#c6e5df]/40 sm:mx-0">
              <MessageSquare className="h-5 w-5 text-foreground" aria-hidden />
            </div>
            <p className="text-sm font-medium text-foreground">WhatsApp</p>
            <a
              href="https://wa.me/233551550530"
              target="_blank"
              rel="noreferrer"
              className="mt-2 block text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              +233 55 155 0530
            </a>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href={`mailto:${SUPPORT_EMAIL}`}
            className="afrusan-cta-pill w-full sm:w-auto"
          >
            <span>Email us</span>
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            href="#contact-form"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border px-8 py-3.5 text-base font-medium text-foreground transition-colors hover:bg-muted sm:w-auto"
          >
            <span>Send a message</span>
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </MarketingContainer>
    </section>
  );
}
