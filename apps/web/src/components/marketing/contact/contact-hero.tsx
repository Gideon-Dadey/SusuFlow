import Image from "next/image";
import Link from "next/link";
import { CONTACT_MAP_IMAGE } from "@/lib/brand-assets";
import { CONTACT_OFFICE, SUPPORT_EMAIL } from "@/lib/marketing-data";
import { Button } from "@/components/ui/button";
import { MarketingContainer } from "../marketing-container";

export function ContactHero() {
  return (
    <section className="bg-white dark:bg-background">
      <MarketingContainer className="marketing-hero-platform-inner pb-14 sm:pb-16 lg:pb-20">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          <div className="order-2 min-w-0 text-left lg:order-1">
            <h1 className="sr-hero-title text-balance text-foreground">
              {CONTACT_OFFICE.headline}
            </h1>

            <h2 className="mt-10 text-base font-bold text-foreground sm:mt-12">
              Office address
            </h2>
            <address className="mt-3 not-italic text-sm leading-relaxed text-muted-foreground sm:text-base">
              {CONTACT_OFFICE.addressLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href={`mailto:${SUPPORT_EMAIL}`}>
                <Button className="h-12 w-full rounded-xl px-6 text-[17px] font-semibold bg-[#0066cc] hover:bg-[#0052a3] text-white shadow-sm sm:w-auto">
                  Email us
                </Button>
              </Link>
              <Link href="#contact-form">
                <Button
                  variant="outline"
                  className="h-12 w-full rounded-xl px-6 text-[17px] font-semibold sm:w-auto"
                >
                  Speak to our team
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative order-1 mx-auto w-full max-w-xl lg:order-2 lg:max-w-none lg:justify-self-end">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-none bg-white dark:bg-background sm:aspect-[5/4]">
              <Image
                src={CONTACT_MAP_IMAGE}
                alt="World map highlighting SusuFlow office location in Ghana"
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 50vw"
                className="object-contain object-center"
              />
            </div>
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
