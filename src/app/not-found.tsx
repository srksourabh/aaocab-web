import Link from "next/link";
import { Phone, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      {/* Large 404 */}
      <p
        className="font-heading font-bold text-8xl md:text-9xl text-primary/20 select-none mb-4"
        aria-hidden="true"
      >
        404
      </p>

      <h1 className="font-heading font-bold text-2xl md:text-3xl text-foreground mb-3">
        Page Not Found
      </h1>

      <p className="text-muted-foreground text-base max-w-sm mb-8">
        The page you are looking for does not exist or may have been moved.
        Head back to the homepage to continue your booking.
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 bg-primary text-primary-foreground font-semibold text-sm px-6 py-3 rounded-full min-h-[44px] hover:bg-[var(--primary-hover)] transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
          Call Support: 7890 302 302
        </a>
      </div>
    </div>
  );
}
