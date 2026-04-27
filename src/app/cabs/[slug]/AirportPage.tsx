import Link from "next/link";
import { notFound } from "next/navigation";
import { Plane, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import FAQSection from "@/components/FAQSection";
import FareTable, { FareRow } from "@/components/FareTable";
import { estimateFareForVehicle } from "@/lib/seo";

// Typical airport transfer distance for fare estimates
const AIRPORT_TRANSFER_KM = 40;

const VEHICLE_DISPLAY: Array<{
  slug: string;
  name: string;
  capacity: number;
  popular?: boolean;
}> = [
  { slug: "sedan", name: "Sedan", capacity: 4, popular: true },
  { slug: "ertiga", name: "Ertiga", capacity: 6 },
  { slug: "innova", name: "Innova", capacity: 7 },
  { slug: "crysta", name: "Innova Crysta", capacity: 7 },
];

const HOW_IT_WORKS_STEPS = [
  {
    step: "1",
    title: "Book in Advance",
    desc: "Enter your flight details, pickup address, and select a vehicle. Pay 20% online to confirm.",
  },
  {
    step: "2",
    title: "Driver Waits at Arrivals",
    desc: "Your driver monitors your flight and waits at the arrivals gate with a name board — even if your flight is delayed.",
  },
  {
    step: "3",
    title: "Ride to Destination",
    desc: "Comfortable, air-conditioned ride to your hotel or home. Fixed fare — no meter running.",
  },
];

export default async function AirportPage({ slug }: { slug: string }) {
  // slug here is the airport slug without "-taxi" suffix
  const { data: airport } = await supabase
    .from("airports")
    .select(
      "id, name, code, slug, city:cities!airports_city_id_fkey(id, name, slug)"
    )
    .eq("slug", slug)
    .single();

  if (!airport) notFound();

  const city = airport.city as unknown as { id: string; name: string; slug: string } | null;
  if (!city) notFound();

  // Nearby airports for related section
  const { data: nearbyAirports } = await supabase
    .from("airports")
    .select("name, slug")
    .neq("id", airport.id)
    .limit(5);

  const fares: FareRow[] = VEHICLE_DISPLAY.map((v) => ({
    vehicle: v.name,
    vehicleSlug: v.slug,
    capacity: v.capacity,
    price: estimateFareForVehicle(AIRPORT_TRANSFER_KM, v.slug),
    popular: v.popular,
  }));

  const sedanFare = fares[0].price;

  const bookingHref = `/book?type=airport&from=${encodeURIComponent(airport.name)}&to=${encodeURIComponent(city.name)}&distance=${AIRPORT_TRANSFER_KM}`;

  const faqs = [
    {
      question: `How much does a taxi from ${airport.name} cost?`,
      answer: `${airport.name} (${airport.code}) taxi fares start at ₹${sedanFare.toLocaleString("en-IN")} for a sedan for a standard 40 km transfer. The final fare depends on your exact pickup/drop address and distance.`,
    },
    {
      question: "Where does the driver meet me at the airport?",
      answer: `Your AaoCab driver waits at the arrivals exit of ${airport.name} holding a name board with your name. You will receive the driver's contact number 1 hour before landing so you can coordinate directly.`,
    },
    {
      question: "Can I book for a midnight flight?",
      answer:
        "Yes. AaoCab operates 24/7, including late-night and early-morning airport transfers. Simply select the correct departure time when booking — our driver will adjust for any flight delays at no extra cost.",
    },
    {
      question: "What if my flight is delayed?",
      answer: `Your driver monitors your flight status in real time. There is no cancellation charge for flight delays. The driver waits up to 60 minutes after landing at no extra cost.`,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 md:py-14">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap">
          <li>
            <Link href="/cabs" className="hover:underline">
              All Cities
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href={`/cabs/${city.slug}`} className="hover:underline">
              {city.name}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground">{airport.name} Taxi</li>
        </ol>
      </nav>

      {/* Heading */}
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <Plane size={28} className="text-primary" aria-hidden="true" />
          <h1 className="font-heading font-bold text-3xl md:text-4xl text-foreground">
            {airport.name} Taxi &amp; Cab Service
          </h1>
        </div>
        <p className="text-muted-foreground text-base max-w-xl">
          Pre-booked airport taxi for {airport.name} ({airport.code}) in{" "}
          {city.name}. Fixed fare, flight tracking, driver waits at arrivals.
        </p>
      </header>

      {/* Airport info card */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-12">
        {[
          { label: "Airport Code", value: airport.code },
          { label: "City", value: city.name },
          { label: "Sedan from", value: `₹${sedanFare.toLocaleString("en-IN")}` },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className="font-heading font-semibold text-foreground text-base">{value}</p>
          </div>
        ))}
      </div>

      {/* Fare table */}
      <section aria-labelledby="airport-fares-heading" className="mb-12">
        <h2
          id="airport-fares-heading"
          className="font-heading font-semibold text-xl md:text-2xl text-foreground mb-6"
        >
          Airport Transfer Fares
        </h2>
        <FareTable fares={fares} bookingHref={bookingHref} />
        <p className="mt-3 flex items-start gap-1.5 text-xs text-muted-foreground">
          <AlertCircle size={13} className="flex-shrink-0 mt-0.5" aria-hidden="true" />
          Fares are estimates for a 40 km transfer and include GST. Actual fare
          depends on your exact distance.
        </p>
      </section>

      {/* How airport pickup works */}
      <section aria-labelledby="how-it-works-heading" className="mb-12">
        <h2
          id="how-it-works-heading"
          className="font-heading font-semibold text-xl md:text-2xl text-foreground mb-6"
        >
          How Airport Pickup Works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {HOW_IT_WORKS_STEPS.map(({ step, title, desc }) => (
            <div key={step} className="flex gap-4">
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-heading font-bold text-sm">
                {step}
              </div>
              <div>
                <p className="font-heading font-semibold text-sm text-foreground mb-1">
                  {title}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust points */}
      <div className="mb-12 rounded-xl bg-primary/5 border border-primary/20 p-6">
        <p className="font-heading font-semibold text-base text-foreground mb-4">
          Why book your {airport.code} taxi with AaoCab?
        </p>
        <ul className="space-y-2">
          {[
            "Driver monitors your flight — free wait up to 60 min after landing",
            "Fixed fare locked at booking — no surge, no meter",
            "Name board at arrivals exit for easy identification",
            "24/7 customer support for last-minute changes",
            "Clean, air-conditioned vehicles with GPS tracking",
          ].map((point) => (
            <li key={point} className="flex items-start gap-2 text-sm text-foreground">
              <CheckCircle
                size={15}
                className="text-primary flex-shrink-0 mt-0.5"
                aria-hidden="true"
              />
              {point}
            </li>
          ))}
        </ul>
      </div>

      {/* FAQ */}
      <FAQSection
        faqs={faqs}
        title={`FAQs — ${airport.name} Taxi`}
      />

      {/* Nearby airports */}
      {(nearbyAirports ?? []).length > 0 && (
        <section
          aria-labelledby="nearby-airports-heading"
          className="py-8 border-t border-border"
        >
          <h2
            id="nearby-airports-heading"
            className="font-heading font-semibold text-base text-foreground mb-4"
          >
            Also serving
          </h2>
          <div className="flex flex-wrap gap-3">
            {(nearbyAirports ?? []).map((a) => (
              <Link
                key={a.slug}
                href={`/cabs/${a.slug}-taxi`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border bg-card text-sm font-medium text-foreground hover:border-primary hover:text-primary transition-colors duration-150"
              >
                <Plane size={13} aria-hidden="true" />
                {a.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <div className="mt-10 text-center">
        <Link
          href={bookingHref}
          className="inline-flex items-center justify-center gap-2 h-14 px-10 rounded-[40px] bg-primary text-primary-foreground font-heading font-semibold text-base hover:bg-primary/90 active:scale-[0.98] transition-all duration-200"
        >
          <Plane size={18} aria-hidden="true" />
          Book {airport.code} Airport Taxi
        </Link>
      </div>
    </div>
  );
}
