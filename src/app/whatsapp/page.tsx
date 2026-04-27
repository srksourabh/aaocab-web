import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle, Phone, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "WhatsApp Booking — AaoCab",
  description:
    "Book your AaoCab cab directly on WhatsApp. Send us a message and our team will help you plan your trip.",
};

export default function WhatsAppPage() {
  const whatsappUrl =
    "https://wa.me/917890302302?text=Hi%2C%20I%20want%20to%20book%20a%20cab";

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div
            className="w-16 h-16 mx-auto rounded-full bg-[#25D366]/10 flex items-center justify-center"
            aria-hidden="true"
          >
            <MessageCircle size={32} className="text-[#25D366]" />
          </div>
          <h1 className="font-heading font-bold text-3xl text-foreground">
            WhatsApp Booking
          </h1>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            Book your cab, get fare quotes, and manage your trips — all through
            WhatsApp. No app download needed.
          </p>
        </div>

        {/* Coming soon card */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="flex items-start gap-3">
            <Clock
              size={20}
              className="text-[#F59E0B] shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div>
              <h2 className="font-heading font-semibold text-foreground">
                Automated booking coming soon
              </h2>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                Our WhatsApp booking bot is under development. Once live, you
                will be able to type your route, pick a vehicle, and confirm
                your booking entirely within WhatsApp — no website visit
                required.
              </p>
            </div>
          </div>
        </div>

        {/* What will be available */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
          <p className="font-heading font-semibold text-foreground">
            Coming features
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {[
              "Instant fare quotes by city pair",
              "One-tap booking confirmation",
              "Driver assignment notifications",
              "Live trip status updates",
              "Easy cancellation by message",
            ].map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"
                  aria-hidden="true"
                />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2.5 h-12 w-full bg-[#25D366] text-white font-semibold text-sm rounded-[40px] hover:bg-[#22c35d] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <MessageCircle size={18} aria-hidden="true" />
            Chat on WhatsApp Now
          </a>

          <a
            href="tel:7890302302"
            className="flex items-center justify-center gap-2.5 h-12 w-full border border-border text-foreground font-semibold text-sm rounded-[40px] hover:bg-muted transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Phone size={18} aria-hidden="true" />
            Call Us: 7890 302 302
          </a>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="text-sm font-medium text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            Book online instead
          </Link>
        </div>
      </div>
    </div>
  );
}
