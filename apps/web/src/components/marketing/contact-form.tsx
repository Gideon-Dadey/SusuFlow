"use client";

import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormCardSkeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const INTENT_COPY: Record<string, { title: string; cta: string }> = {
  demo: {
    title: "Request a demo",
    cta: "Request demo",
  },
  sales: {
    title: "Contact sales",
    cta: "Contact sales",
  },
};

const fieldClassName =
  "min-h-[3rem] rounded-xl border-border bg-background text-base";

const textareaClassName = cn(
  fieldClassName,
  "flex w-full resize-y px-4 py-3 ring-offset-background",
  "hover:border-border focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
);

function ContactFormInner() {
  const searchParams = useSearchParams();
  const intent = searchParams.get("intent") || "general";
  const copy = INTENT_COPY[intent] || {
    title: "Send a message",
    cta: "Send message",
  };

  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-[#c6e5df] bg-[#c6e5df]/20 px-6 py-10 text-center">
        <p className="font-geist text-xl font-medium text-foreground">
          Message sent
        </p>
        <p className="afrusan-body mt-3 text-balance">
          Thanks for reaching out. We&apos;ll get back to you within one
          business day.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <input type="hidden" name="intent" value={intent} />
      <p className="font-geist text-lg font-medium text-foreground">
        {copy.title}
      </p>

      <div>
        <label
          htmlFor="name"
          className="mb-2 block text-sm font-medium text-foreground"
        >
          Name
        </label>
        <Input id="name" name="name" required className={fieldClassName} />
      </div>

      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium text-foreground"
        >
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          className={fieldClassName}
        />
      </div>

      <div>
        <label
          htmlFor="company"
          className="mb-2 block text-sm font-medium text-foreground"
        >
          Susu company
        </label>
        <Input
          id="company"
          name="company"
          required={intent === "demo"}
          className={fieldClassName}
        />
      </div>

      <div>
        <label
          htmlFor="message"
          className="mb-2 block text-sm font-medium text-foreground"
        >
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className={textareaClassName}
        />
      </div>

      <Button
        type="submit"
        className="h-12 w-full rounded-full text-base font-medium"
      >
        {copy.cta}
      </Button>
    </form>
  );
}

export function ContactForm() {
  return (
    <Suspense fallback={<FormCardSkeleton />}>
      <ContactFormInner />
    </Suspense>
  );
}
