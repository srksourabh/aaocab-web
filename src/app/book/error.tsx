"use client";

import Link from "next/link";
import { Phone, RefreshCw, ArrowLeft } from "lucide-react";

export default function BookError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="font-heading font-bold text-2xl md:text-3xl text-foreground mb-3">
        Something went wrong
      </h1>

      <p className="text-muted-foreground text-base max-w-sm mb-8">
        We could not load the booking page. Please try again or start a new
        search from the homepage.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={() => unstable_retry()}
          className="flex items-center gap-2 bg-primary text-primary-foreground font-semibold text-sm px-6 py-3 rounded-full min-h-[44px] hover:bg-[var(--primary-hover)] transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <RefreshCw size={16} aria-hidden="true" />
          Try Again
        </button>

        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold text-muted-foreground border border-border rounded-full px-6 py-3 min-h-[44px] hover:bg-muted transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to Home
        </Link>

        <a
          href="tel:7890302302"
          aria-label="Call AaoCab support at 7890302302"
          className="flex items-center gap-2 text-sm font-semibold text-primary border border-primary rounded-full px-6 py-3 min-h-[44px] hover:bg-primary/10 transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Phone size={16} aria-hidden="true" />
          Call Support
        </a>
      </div>
    </div>
  );
}
