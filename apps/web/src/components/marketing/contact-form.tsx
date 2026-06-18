'use client';

import { useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="intent" value={intent} />
      <p className="text-sm font-medium text-secondary">{copy.title}</p>
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-foreground">
          Name
        </label>
        <Input id="name" name="name" required />
      </div>
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
          Email
        </label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div>
        <label htmlFor="company" className="mb-1.5 block text-sm font-medium text-foreground">
          Susu company
        </label>
        <Input id="company" name="company" required={intent === 'demo'} />
      </div>
      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-foreground">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
      <Button type="submit" className="w-full rounded-lg">
        {copy.cta}
      </Button>
    </form>
  );
}

export function ContactForm() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading form…</p>}>
      <ContactFormInner />
    </Suspense>
  );
}
