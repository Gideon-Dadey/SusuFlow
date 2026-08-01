import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { BrandLockup } from "@/components/marketing/brand-logo";
import { AUTH_LOGIN_IMAGE } from "@/lib/brand-assets";
import { APP_NAME } from "@/lib/marketing-data";

export function AuthShell({ children }: { children: React.ReactNode }) {
  const year = new Date().getFullYear();

  return (
    <div className="auth-split overflow-hidden bg-background lg:grid lg:grid-cols-2">
      <div className="relative flex h-full flex-col overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden bg-background">
        <div className="flex items-center justify-between gap-3 px-5 pt-5 sm:px-6 lg:hidden">
          <BrandLockup priority wordmarkClassName="text-xl" />
          <Link
            href="/"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-none text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Back to home"
          >
            <X className="h-5 w-5" />
          </Link>
        </div>

        <div className="flex flex-1 items-center px-5 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-8 xl:px-12">
          <div className="w-full animate-fade-in">{children}</div>
        </div>
      </div>

      <div className="relative hidden h-full overflow-hidden lg:block">
        <Image
          src={AUTH_LOGIN_IMAGE}
          alt=""
          fill
          priority
          sizes="50vw"
          className="object-cover object-center scale-[1.02]"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-br from-brand-dark/80 via-brand-dark/55 to-brand-dark/70"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/10"
          aria-hidden
        />
        <div className="relative z-10 flex h-full flex-col justify-between p-8 xl:p-10">
          <div className="flex items-start justify-between gap-4">
            <BrandLockup priority onDark wordmarkClassName="text-2xl" />
            <Link
              href="/"
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-none text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Back to home"
            >
              <X className="h-5 w-5" />
            </Link>
          </div>
          <p className="text-sm text-white/70">
            © {year} {APP_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
