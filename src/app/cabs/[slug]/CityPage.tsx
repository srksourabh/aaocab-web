import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Route, Car } from "lucide-react";
import { supabase } from "@/lib/supabase";
import FAQSection from "@/components/FAQSection";
import { estimateFareForVehicle } from "@/lib/seo";

const VEHICLE_DISPLAY = [
  { slug: "sedan", name: "Sedan", capacity: 4, popular: true },
  { slug: "ertiga", name: "Ertiga", capacity: 6, popular: false },
  { slug: "innova", name: "Innova", capacity: 7, popular: false },
  { slug: "crysta", name: "Innova Crysta", capacity: 7, popular: false },
  { slug: "12-seater", name: "12-Seater", capacity: 12, popular: false },
];

const CITY_ESTIMATE_KM = 100;

export default async function CityPage({ slug }: { slug: string }) {
  const { data: city } = await supabase
    .from("cities")
    .select("id, name, slug, state")
    .eq("slug", slug)
    .single();

  if (!city) notFound();

  const [{ data: routesFrom }, { data: routesTo }, { data: otherCities }] =
    await Promise.all([
      supabase
        .from("routes")
        .select(
          "id, slug, distance_km, duration_minutes, to_city:cities!routes_to_city_id_fkey(name, slug)"
        )
        .eq("from_city_id", city.id)
        .limit(12),
      supabase
        .from("routes")
        .select("id, slug, from_city:cities!routes_from_city_id_fkey(name, slug)")
        .eq("to_city_id", city.id)
        .limit(6),
      supabase
        .from("cities")
        .select("name, slug")
        .neq("id", city.id)
        .order("name", { ascending: true })
        .limit(8),
    ]);

  const fromRoutes = routesFrom ?? [];
  const toRoutes = routesTo ?? [];
  const lowestPrice = estimateFareForVehicle(CITY_ESTIMATE_KM, "sedan");

  const faqs = [
    {
      question: `How much does a cab cost in ${city.name}?`,
      answer: `Cab fares in ${city.name} start from ₹${lowestPrice.toLocaleString("en-IN")} for a sedan on a 100 km trip. Prices depend on distance, vehicle, and tolls. All AaoCab fares are fixed — no surge.`,
    },
    {
      question: `How to book a cab in ${city.name}?`,
      answer: `Enter ${city.name} as pickup city, choose your destination, pick a date and time (at least 4 hours ahead), select a vehicle, and pay 20% advance. Driver is assigned instantly.`,
    },
    {
      question: `What car types are available in ${city.name}?`,
      answer: `AaoCab offers Sedan (4 seats), Ertiga (6 seats), Innova (7 seats), Innova Crysta (7 seats), 12-seater and 16-seater Tempo Traveller in ${city.name}.`,
    },
    {
      question: "Is AaoCab safe for families?",
      answer:
        "Yes. All drivers are background-verified with valid commercial licences. Every booking includes driver contact details, trip tracking, and 24/7 support.",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 md:py-14">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <li>
            <Link href="/cabs" className="hover:underline">
              All Cities
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground">{city.name}</li>
        </ol>
      </nav>

      {/* Page heading */}
      <header className="mb-10">
        <h1 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-3">
          Cab Rental in {city.name}
        </h1>
        <p className="text-muted-foreground text-base max-w-xl">
          Pre-booked cab service in {city.name}, {city.state}. Fixed fares, no
          surge pricing, verified drivers.
        </p>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-4">
          {fromRoutes.length > 0 && (
            <span className="flex items-center gap-1.5">
              <Route size={16} aria-hidden="true" />
              {fromRoutes.length} routes available
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Car size={16} aria-hidden="true" />
            Sedan from ₹{lowestPrice.toLocaleString("en-IN")}
          </span>
        </div>
      </header>

      {/* Routes from this city */}
      {fromRoutes.length > 0 && (
        <section aria-labelledby="routes-from-heading" className="mb-12">
          <h2
            id="routes-from-heading"
            className="font-heading font-semibold text-xl md:text-2xl text-foreground mb-6"
          >
            Popular Routes from {city.name}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {fromRoutes.map((route) => {
              const dest = route.to_city as unknown as { name: string; slug: string } | null;
              if (!dest) return null;
              const sedanFare = estimateFareForVehicle(route.distance_km, "sedan");
              const innoFare = estimateFareForVehicle(route.distance_km, "innova");
              const hours = Math.floor((route.duration_minutes ?? 0) / 60);
              const mins = (route.duration_minutes ?? 0) % 60;
              const duration = hours > 0 ? `${hours}h${mins > 0 ? ` ${mins}m` : ""}` : `${mins}m`;

              return (
                <Link
                  key={route.id}
                  href={`/cabs/${route.slug}`}
                  className="group rounded-xl border border-border bg-card p-5 hover:border-primary hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="font-heading font-semibold text-base text-foreground group-hover:text-primary transition-colors">
                        {city.name} → {dest.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {route.distance_km} km · {duration}
                      </p>
                    </div>
                    <MapPin
                      size={18}
                      className="text-primary flex-shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Sedan ₹{sedanFare.toLocaleString("en-IN")} — Innova ₹
                    {innoFare.toLocaleString("en-IN")}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Vehicle options */}
      <section aria-labelledby="vehicles-heading" className="mb-12">
        <h2
          id="vehicles-heading"
          className="font-heading font-semibold text-xl md:text-2xl text-foreground mb-6"
        >
          Vehicle Options in {city.name}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {VEHICLE_DISPLAY.map((v) => {
            const price = estimateFareForVehicle(CITY_ESTIMATE_KM, v.slug);
            return (
              <div
                key={v.slug}
                className={`rounded-xl border p-4 text-center ${
                  v.popular ? "border-primary bg-primary/5" : "border-border bg-card"
                }`}
              >
                {v.popular && (
                  <span className="inline-block text-[10px] font-heading font-semibold bg-primary text-primary-foreground px-2 py-0.5 rounded-full uppercase tracking-wide mb-2">
                    Popular
                  </span>
                )}
                <Car size={28} className="mx-auto text-muted-foreground mb-2" aria-hidden="true" />
                <p className="font-heading font-semibold text-sm text-foreground">{v.name}</p>
                <p className="text-xs text-muted-foreground mb-2">{v.capacity} seats</p>
                <p className="font-bold text-primary text-sm">
                  From ₹{price.toLocaleString("en-IN")}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Reverse routes — book to this city */}
      {toRoutes.length > 0 && (
        <section aria-labelledby="to-city-heading" className="mb-12">
          <h2
            id="to-city-heading"
            className="font-heading font-semibold text-xl md:text-2xl text-foreground mb-4"
          >
            Book a Cab to {city.name} From
          </h2>
          <div className="flex flex-wrap gap-3">
            {toRoutes.map((route) => {
              const src = route.from_city as unknown as { name: string; slug: string } | null;
              if (!src) return null;
              return (
                <Link
                  key={route.id}
                  href={`/cabs/${route.slug}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border bg-card text-sm font-medium text-foreground hover:border-primary hover:text-primary transition-colors duration-150"
                >
                  <MapPin size={13} aria-hidden="true" />
                  {src.name}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* FAQ */}
      <FAQSection faqs={faqs} title={`FAQs — Cabs in ${city.name}`} />

      {/* Also serving */}
      {(otherCities ?? []).length > 0 && (
        <section
          aria-labelledby="also-serving-heading"
          className="py-8 border-t border-border"
        >
          <h2
            id="also-serving-heading"
            className="font-heading font-semibold text-base text-foreground mb-4"
          >
            Also serving
          </h2>
          <div className="flex flex-wrap gap-3">
            {(otherCities ?? []).map((c) => (
              <Link
                key={c.slug}
                href={`/cabs/${c.slug}`}
                className="text-sm text-muted-foreground hover:text-primary transition-colors duration-150 underline-offset-2 hover:underline"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
