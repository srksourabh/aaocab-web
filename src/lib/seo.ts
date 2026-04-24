// Per-km rates by vehicle slug — must stay in sync with booking.ts
const KM_RATES: Record<string, number> = {
  sedan: 11,
  ertiga: 14,
  innova: 16,
  crysta: 18,
  "12-seater": 22,
  "16-seater": 28,
};

const DRIVER_ALLOWANCE = 300;
const GST_RATE = 0.05;

/**
 * Estimates a total fare for a given distance and vehicle category slug.
 * Uses the same formula as generateFareEstimate in booking.ts.
 */
export function estimateFareForVehicle(
  distanceKm: number,
  vehicleSlug: string
): number {
  const rate = KM_RATES[vehicleSlug] ?? 11;
  const baseFare = Math.round(distanceKm * rate);
  const subtotal = baseFare + DRIVER_ALLOWANCE;
  const gst = Math.round(subtotal * GST_RATE);
  return subtotal + gst;
}

/**
 * Generates an SEO-friendly description for a city landing page.
 */
export function generateCityDescription(
  city: string,
  routeCount: number,
  lowestPrice: number
): string {
  return `Book pre-planned cab rental in ${city}. Serving ${routeCount}+ routes with no surge pricing. Sedan from ₹${lowestPrice.toLocaleString("en-IN")}. Verified drivers, 4-hour advance booking.`;
}

/**
 * Generates an SEO-friendly description for a route landing page.
 */
export function generateRouteDescription(
  from: string,
  to: string,
  distance: number,
  lowestPrice: number
): string {
  return `${from} to ${to} cab booking starting ₹${lowestPrice.toLocaleString("en-IN")}. ${distance} km journey with verified drivers. No hidden charges — fare fixed at booking.`;
}

/**
 * Returns a JSON-LD FAQPage schema object for the given FAQ list.
 * Embed with: <script type="application/ld+json">{JSON.stringify(schema)}</script>
 */
export function generateFAQSchema(
  faqs: Array<{ question: string; answer: string }>
): object {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer,
      },
    })),
  };
}

/**
 * Returns a JSON-LD LocalBusiness schema for AaoCab.
 * Embed once in the root layout.
 */
export function generateLocalBusinessSchema(): object {
  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: "AaoCab",
    url: "https://aaocab.com",
    logo: "https://aaocab.com/logo.png",
    telephone: "+917890302302",
    description:
      "AaoCab offers pre-booked car rental across India. No surge pricing, no surprises. Outstation, local, and airport transfer cabs with verified drivers.",
    areaServed: {
      "@type": "Country",
      name: "India",
    },
    priceRange: "₹₹",
    sameAs: [
      "https://www.facebook.com/aaocab",
      "https://www.instagram.com/aaocab",
    ],
  };
}
