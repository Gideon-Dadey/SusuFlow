'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormCardSkeleton } from '@/components/ui/skeleton';

const INTENT_COPY: Record<string, { title: string; cta: string }> = {
  demo: {
    title: 'Request a demo',
    cta: 'Request demo',
  },
  sales: {
    title: 'Contact sales',
    cta: 'Contact sales',
  },
};

function ContactFormInner() {
  const searchParams = useSearchParams();
  const intent = searchParams.get('intent') || 'general';
  const copy = INTENT_COPY[intent] || {
    title: 'Send a message',
    cta: 'Send message',
  };

  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="py-8 text-center">
        <p className="text-lg font-semibold text-foreground">Message sent</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Thanks for reaching out. We&apos;ll get back to you within one business day.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <input type="hidden" name="intent" value={intent} />
      <p className="text-sm font-semibold text-foreground">{copy.title}</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="mb-1.5 block text-sm font-medium text-foreground">
            First name<span className="text-destructive">*</span>
          </label>
          <Input id="firstName" name="firstName" required autoComplete="given-name" />
        </div>
        <div>
          <label htmlFor="lastName" className="mb-1.5 block text-sm font-medium text-foreground">
            Last name<span className="text-destructive">*</span>
          </label>
          <Input id="lastName" name="lastName" required autoComplete="family-name" />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
          Email<span className="text-destructive">*</span>
        </label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>

      <div>
        <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-foreground">
          Phone<span className="text-destructive">*</span>
        </label>
        <Input id="phone" name="phone" type="tel" required autoComplete="tel" />
      </div>

      <div>
        <label htmlFor="company" className="mb-1.5 block text-sm font-medium text-foreground">
          Susu company<span className="text-destructive">*</span>
        </label>
        <Input id="company" name="company" required={intent === 'demo' || intent === 'sales'} />
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-foreground">
          Message<span className="text-destructive">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        By submitting this form, you consent to SusuFlow using your information to respond to your
        enquiry. See our{' '}
        <Link href="/privacy" className="font-medium text-secondary hover:text-secondary/80">
          Privacy Policy
        </Link>
        .
      </p>

      <Button type="submit" className="h-12 w-full rounded-lg text-sm font-semibold">
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
