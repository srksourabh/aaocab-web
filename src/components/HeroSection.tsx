"use client";

import { useState } from "react";
import BookingWidget, {
  type BookingWidgetInitialValues,
} from "@/components/BookingWidget";
import NLPSearchBar from "@/components/NLPSearchBar";
import { type ParsedTrip } from "@/lib/ai/nlp-search";

function parsedTripToInitialValues(
  result: ParsedTrip
): BookingWidgetInitialValues {
  return {
    from: result.from ?? undefined,
    to: result.to ?? undefined,
    date: result.date ?? undefined,
    time: result.time ?? undefined,
    roundTrip: result.roundTrip,
  };
}

export default function HeroSection() {
  const [widgetValues, setWidgetValues] =
    useState<BookingWidgetInitialValues | undefined>(undefined);

  function handleParsed(result: ParsedTrip) {
    // Create a new object reference each time so BookingWidget's useEffect fires
    setWidgetValues(parsedTripToInitialValues(result));
  }

  return (
    <section
      aria-label="Book a cab"
      className="relative min-h-[calc(100vh-64px)] md:min-h-0 md:py-16 flex items-start md:items-center overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, var(--primary-light) 0%, #ffffff 60%)",
      }}
    >
      {/* Background video — very low opacity for texture */}
      <video
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover opacity-[0.07] pointer-events-none"
      >
        <source src="/video/hero-bg.mp4" type="video/mp4" />
      </video>

      <div className="relative z-10 max-w-7xl mx-auto px-4 w-full py-10 md:py-0">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Headlines */}
          <div className="flex flex-col gap-4">
            <h1 className="font-heading font-bold text-4xl md:text-5xl text-foreground leading-tight tracking-tight">
              Aao, Chalein!
            </h1>
            <p className="text-lg text-muted-foreground font-sans leading-relaxed max-w-md">
              Pre-booked car rental.{" "}
              <span className="text-foreground font-semibold">No surge.</span>{" "}
              <span className="text-foreground font-semibold">
                No surprises.
              </span>
            </p>
            <p className="text-sm text-muted-foreground">
              Available across 500+ cities in India
            </p>
          </div>

          {/* NLP Search + Booking widget */}
          <div className="w-full">
            <NLPSearchBar onParsed={handleParsed} />
            <BookingWidget initialValues={widgetValues} />
          </div>
        </div>
      </div>
    </section>
  );
}

