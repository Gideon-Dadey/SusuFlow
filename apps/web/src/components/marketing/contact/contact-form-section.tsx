import {
  Clock,
  Mail,
  MapPin,
  MessageSquare,
} from "@/components/icons/phosphor";
import { ContactForm } from "@/components/marketing/contact/contact-form";
import { CONTACT_OFFICE, SUPPORT_EMAIL } from "@/lib/marketing-data";
import { MarketingContainer } from "../marketing-container";

export function ContactFormSection() {
  return (
    <section id="contact-form" className="scroll-mt-24 bg-[var(--ofx-paper)]">
      <MarketingContainer className="ofx-section">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start">
          <div className="omnih-atmosphere border border-white/40 bg-white/70 p-6 shadow-[0_8px_32px_rgba(15,23,42,0.06)] backdrop-blur-md dark:border-white/10 dark:bg-white/5 sm:p-9">
            <ContactForm />
          </div>

          <aside className="bg-[#f7f7f7] p-7 dark:bg-slate-900 sm:p-9">
            <p className="ofx-eyebrow">Our office</p>
            <h2 className="ofx-h3 mt-3">{CONTACT_OFFICE.headline}</h2>

            <ul className="mt-8 space-y-6">
              <li className="flex items-start gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center bg-white">
                  <MapPin className="h-4 w-4 text-foreground" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Address
                  </p>
                  <address className="mt-1 not-italic text-[15px] leading-relaxed text-muted-foreground">
                    {CONTACT_OFFICE.addressLines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </address>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center bg-white">
                  <Mail className="h-4 w-4 text-foreground" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">Email</p>
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="mt-1 block text-[15px] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {SUPPORT_EMAIL}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center bg-white">
                  <MessageSquare
                    className="h-4 w-4 text-foreground"
                    aria-hidden
                  />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    WhatsApp
                  </p>
                  <a
                    href="https://wa.me/233551550530"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 block text-[15px] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    +233 55 155 0530
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center bg-white">
                  <Clock className="h-4 w-4 text-foreground" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Response time
                  </p>
                  <p className="mt-1 text-[15px] text-muted-foreground">
                    Within 1 business day
                  </p>
                </div>
              </li>
            </ul>
          </aside>
        </div>
      </MarketingContainer>
    </section>
  );
}
