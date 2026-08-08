import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center text-foreground">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-muted/40 text-2xl font-medium">
        404
      </div>
      <h1 className="font-geist text-2xl font-medium tracking-tight sm:text-3xl">
        Page Not Found
      </h1>
      <p className="mt-2 max-w-sm text-base text-muted-foreground">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link href="/" className="afrusan-cta-pill mt-6 inline-flex text-sm">
        Return to Home
      </Link>
    </div>
  );
}
