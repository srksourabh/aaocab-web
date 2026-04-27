"use client";

import Link from "next/link";
import { Phone, MessageCircle, RefreshCw } from "lucide-react";

export default function GlobalError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      {/* Brand wordmark */}
      <Link
        href="/"
        className="font-heading font-bold text-2xl text-primary tracking-tight mb-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
      >
        AaoCab
      </Link>

      {/* Heading */}
      <h1 className="font-heading font-bold text-2xl md:text-3xl text-foreground mb-3">
        Something went wrong
      </h1>

      <p className="text-muted-foreground text-base max-w-sm mb-8">
        We ran into an unexpected error. Your booking data is safe. Please try
        again or contact our support team.
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={() => unstable_retry()}
          className="flex items-center gap-2 bg-primary text-primary-foreground font-semibold text-sm px-6 py-3 rounded-full min-h-[44px] hover:bg-[var(--primary-hover)] transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <RefreshCw size={16} aria-hidden="true" />
          Try Again
        </button>

        <a
          href="tel:7890302302"
          aria-label="Call AaoCab support at 7890302302"
          className="flex items-center gap-2 text-sm font-semibold text-primary border border-primary rounded-full px-6 py-3 min-h-[44px] hover:bg-primary/10 transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Phone size={16} aria-hidden="true" />
          Call Support: 7890 302 302
        </a>

        <a
          href="https://wa.me/917890302302"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contact AaoCab on WhatsApp"
          className="flex items-center gap-2 text-sm font-semibold text-muted-foreground border border-border rounded-full px-6 py-3 min-h-[44px] hover:bg-muted transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <MessageCircle size={16} aria-hidden="true" />
          WhatsApp Us
        </a>
      </div>
    </div>
  );
}
