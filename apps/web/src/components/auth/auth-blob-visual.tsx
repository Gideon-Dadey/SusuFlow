import Link from "next/link";
import { X } from "@/components/icons/phosphor";
import { BrandLockup } from "@/components/marketing/brand-logo";
import { APP_NAME } from "@/lib/marketing-data";

export function AuthBlobVisual({ tagline }: { tagline: string }) {
  const year = new Date().getFullYear();

  return (
    <div className="auth-blob relative flex h-full w-full flex-col justify-between overflow-hidden bg-[#111111] p-8 xl:p-12">
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 800 1000"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <defs>
          <linearGradient
            id="auth-blob-fill-a"
            x1="18%"
            y1="8%"
            x2="86%"
            y2="92%"
          >
            <stop offset="0%" stopColor="#5a5a58" />
            <stop offset="100%" stopColor="#2c2c2a" />
          </linearGradient>
          <linearGradient
            id="auth-blob-fill-b"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#6e6e6b" />
            <stop offset="100%" stopColor="#3a3a38" />
          </linearGradient>
          <linearGradient
            id="auth-blob-fill-c"
            x1="30%"
            y1="0%"
            x2="80%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#3f3f3d" />
            <stop offset="100%" stopColor="#1f1f1d" />
          </linearGradient>
        </defs>

        <g
          className="auth-blob-drift-slow"
          style={{ transformOrigin: "220px 280px" }}
        >
          <path
            fill="url(#auth-blob-fill-c)"
            d="M80 210C20 150 40 40 150 30C270 18 330 90 360 180C392 276 340 370 240 390C130 412 130 270 80 210Z"
          />
        </g>

        <g
          className="auth-blob-drift"
          style={{ transformOrigin: "520px 380px" }}
        >
          <path
            fill="url(#auth-blob-fill-a)"
            d="M430 90C560 40 730 90 770 250C812 420 720 560 560 590C390 622 250 520 230 360C210 200 310 136 430 90Z"
          />
        </g>

        <g className="auth-blob-sat" style={{ transformOrigin: "620px 160px" }}>
          <path
            fill="url(#auth-blob-fill-b)"
            d="M560 40C640 10 740 50 760 140C782 236 700 300 610 290C516 280 490 180 520 110C536 72 520 54 560 40Z"
          />
        </g>
      </svg>

      <div className="relative z-10 flex items-start justify-between gap-4">
        <BrandLockup priority wordmarkClassName="text-2xl" />
        <Link
          href="/"
          className="inline-flex size-8 items-center justify-center text-white/70 transition-all hover:scale-110 hover:text-white"
          aria-label="Back to home"
        >
          <X className="h-5 w-5" />
        </Link>
      </div>

      <div className="auth-blob-copy relative z-10 max-w-md space-y-3">
        <p>{tagline}</p>
        <p>
          © {year} {APP_NAME}. All rights reserved.
        </p>
      </div>
    </div>
  );
}
