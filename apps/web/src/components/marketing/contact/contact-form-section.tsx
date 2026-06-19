import { ContactForm } from '@/components/marketing/contact-form';
import { MarketingContainer } from '../marketing-container';

export function ContactFormSection() {
  return (
    <section id="contact-form" className="scroll-mt-24 border-b border-border bg-[#f4f6f8] dark:bg-background">
      <MarketingContainer className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-2xl text-left lg:text-center">
          <h2 className="text-balance text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
            Talk to our team about your susu company
          </h2>
          <p className="mt-4 text-pretty text-base text-muted-foreground">
            Tell us about your operation and we will route your message to the right person: sales,
            support, or partnerships.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-2xl rounded-lg border border-border/80 bg-white p-6 shadow-sm dark:border-border dark:bg-card dark:shadow-none sm:mt-12 sm:p-8">
          <ContactForm />
        </div>
      </MarketingContainer>
    </section>
  );
}
