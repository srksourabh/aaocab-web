import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, MapPin, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import FAQSection from "@/components/FAQSection";
import FareTable, { FareRow } from "@/components/FareTable";
import { estimateFareForVehicle } from "@/lib/seo";
import PriceComparison from "@/components/PriceComparison";
import TripPlanner from "@/components/TripPlanner";
import ReviewInsights from "@/components/ReviewInsights";

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
  { slug: "12-seater", name: "12-Seater", capacity: 12 },
  { slug: "16-seater", name: "16-Seater", capacity: 16 },
];

export default async function RoutePage({ slug }: { slug: string }) {
  const { data: route } = await supabase
    .from("routes")
    .select(
      "id, slug, distance_km, duration_minutes, toll_estimate, from_city:cities!routes_from_city_id_fkey(id, name, slug), to_city:cities!routes_to_city_id_fkey(id, name, slug)"
    )
    .eq("slug", slug)
    .single();

  if (!route) notFound();

  const fromCity = route.from_city as unknown as { id: string; name: string; slug: string } | null;
  const toCity = route.to_city as unknown as { id: string; name: string; slug: string } | null;

  if (!fromCity || !toCity) notFound();

  // Sibling routes from the same origin city
  const { data: siblingRoutes } = await supabase
    .from("routes")
    .select("slug, to_city:cities!routes_to_city_id_fkey(name, slug)")
    .eq("from_city_id", fromCity.id)
    .neq("id", route.id)
    .limit(5);

  // Reviews for this route
  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, rating, review_text, created_at")
    .eq("route_key", slug)
    .order("created_at", { ascending: false })
    .limit(5);

  const fares: FareRow[] = VEHICLE_DISPLAY.map((v) => ({
    vehicle: v.name,
    vehicleSlug: v.slug,
    capacity: v.capacity,
    price: estimateFareForVehicle(route.distance_km, v.slug),
    popular: v.popular,
  }));

  const hours = Math.floor((route.duration_minutes ?? 0) / 60);
  const mins = (route.duration_minutes ?? 0) % 60;
  const durationLabel =
    hours > 0 ? `${hours} hr${mins > 0 ? ` ${mins} min` : ""}` : `${mins} min`;

  const sedanFare = fares[0].price;

  // Booking URL pre-filled with from/to
  const bookingHref = `/book?type=outstation&from=${encodeURIComponent(fromCity.name)}&to=${encodeURIComponent(toCity.name)}&distance=${route.distance_km}`;

  const faqs = [
    {
      question: `How much does a ${fromCity.name} to ${toCity.name} cab cost?`,
      answer: `A ${fromCity.name} to ${toCity.name} cab starts at ₹${sedanFare.toLocaleString("en-IN")} for a sedan. The fare includes driver allowance and GST. Toll is charged separately. All fares are fixed at booking — no surge.`,
    },
    {
      question: `How long does ${fromCity.name} to ${toCity.name} take by car?`,
      answer: `The ${fromCity.name} to ${toCity.name} road trip covers ${route.distance_km} km and takes approximately ${durationLabel} by car, depending on traffic and road conditions.`,
    },
    {
      question: `What is the best car for ${fromCity.name} to ${toCity.name}?`,
      answer: `For solo or couple travel, a sedan (₹${sedanFare.toLocaleString("en-IN")}) is most economical. For families of 4–6, an Ertiga or Innova offers more comfort. For 7+ passengers, the Innova Crysta or a 12-seater is ideal.`,
    },
    {
      question: "Can I book a round trip?",
      answer: `Yes. Select the Round Trip option when booking ${fromCity.name} to ${toCity.name}. The return leg is pre-arranged with the same driver, and you get a combined fare — no extra booking fees.`,
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
            <Link href={`/cabs/${fromCity.slug}`} className="hover:underline">
              {fromCity.name}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground">
            {fromCity.name} to {toCity.name}
          </li>
        </ol>
      </nav>

      {/* Heading */}
      <header className="mb-10">
        <h1 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-3">
          {fromCity.name} to {toCity.name} Cab Booking
        </h1>
        <p className="text-muted-foreground text-base max-w-xl">
          Fixed fare cab from {fromCity.name} to {toCity.name}. Verified drivers,
          no hidden charges.
        </p>
      </header>

      {/* Route info card */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
        {[
          { label: "Distance", value: `${route.distance_km} km` },
          { label: "Duration", value: durationLabel },
          {
            label: "Toll Est.",
            value:
              route.toll_estimate > 0
                ? `₹${route.toll_estimate.toLocaleString("en-IN")}`
                : "Minimal",
          },
          { label: "Advance Pay", value: "20% only" },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-xl border border-border bg-card p-4 text-center"
          >
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className="font-heading font-semibold text-foreground text-base">{value}</p>
          </div>
        ))}
      </div>

      {/* Fare table */}
      <section aria-labelledby="fares-heading" className="mb-12">
        <h2
          id="fares-heading"
          className="font-heading font-semibold text-xl md:text-2xl text-foreground mb-6"
        >
          Fare Estimates
        </h2>
        <FareTable fares={fares} bookingHref={bookingHref} />
        <p className="mt-3 flex items-start gap-1.5 text-xs text-muted-foreground">
          <AlertCircle size={13} className="flex-shrink-0 mt-0.5" aria-hidden="true" />
          Fares include base fare, driver allowance, and GST. Toll charges
          (est. ₹{route.toll_estimate.toLocaleString("en-IN")}) are extra and paid
          at toll plazas.
        </p>
      </section>

      {/* Price comparison strip */}
      <div className="mb-12">
        <PriceComparison from={fromCity.name} to={toCity.name} />
      </div>

      {/* Popular stops placeholder */}
      <section aria-labelledby="stops-heading" className="mb-12">
        <h2
          id="stops-heading"
          className="font-heading font-semibold text-xl md:text-2xl text-foreground mb-4"
        >
          Popular Stops Along the Way
        </h2>
        <p className="text-muted-foreground text-sm">
          Enjoy brief stops en route from {fromCity.name} to {toCity.name}.
          Popular halt points include heritage sites, local dhabas, and scenic
          viewpoints — ask your driver for recommendations.
        </p>
      </section>

      {/* Travel tips placeholder */}
      <section aria-labelledby="tips-heading" className="mb-12">
        <h2
          id="tips-heading"
          className="font-heading font-semibold text-xl md:text-2xl text-foreground mb-4"
        >
          Travel Tips
        </h2>
        <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
          <li>
            Book at least 4 hours in advance to ensure driver availability.
          </li>
          <li>
            Carry cash for tolls — the exact toll amount may vary with traffic
            routing.
          </li>
          <li>
            Early morning departures from {fromCity.name} avoid city traffic and
            reach {toCity.name} before afternoon.
          </li>
          <li>
            Share your AaoCab trip link with family for live tracking.
          </li>
        </ul>
      </section>

      {/* AI Trip Planner */}
      <TripPlanner
        from={fromCity.name}
        to={toCity.name}
        distanceKm={route.distance_km}
        durationMinutes={route.duration_minutes ?? 0}
      />

      {/* Reviews */}
      <section aria-labelledby="reviews-heading" className="mb-12">
        <h2
          id="reviews-heading"
          className="font-heading font-semibold text-xl md:text-2xl text-foreground mb-6"
        >
          Traveller Reviews
        </h2>
        <ReviewInsights reviews={reviews ?? []} />
        {(reviews ?? []).length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground text-sm">
            Be the first to review this route after your trip!
          </div>
        ) : (
          <div className="space-y-4">
            {(reviews ?? []).map((r) => (
              <div
                key={r.id}
                className="rounded-xl border border-border bg-card p-5"
              >
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      aria-hidden="true"
                      className={
                        i < r.rating ? "text-amber-400" : "text-muted"
                      }
                    >
                      ★
                    </span>
                  ))}
                  <span className="sr-only">{r.rating} out of 5 stars</span>
                </div>
                <p className="text-sm text-foreground">{r.review_text}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* FAQ */}
      <FAQSection
        faqs={faqs}
        title={`FAQs — ${fromCity.name} to ${toCity.name} Cab`}
      />

      {/* Related routes */}
      {(siblingRoutes ?? []).length > 0 && (
        <section
          aria-labelledby="related-routes-heading"
          className="py-8 border-t border-border"
        >
          <h2
            id="related-routes-heading"
            className="font-heading font-semibold text-base text-foreground mb-4"
          >
            Other routes from {fromCity.name}
          </h2>
          <div className="flex flex-wrap gap-3">
            {(siblingRoutes ?? []).map((r) => {
              const dest = r.to_city as unknown as { name: string; slug: string } | null;
              if (!dest) return null;
              return (
                <Link
                  key={r.slug}
                  href={`/cabs/${r.slug}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border bg-card text-sm font-medium text-foreground hover:border-primary hover:text-primary transition-colors duration-150"
                >
                  <MapPin size={13} aria-hidden="true" />
                  {fromCity.name} → {dest.name}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* CTA */}
      <div className="mt-10 text-center">
        <Link
          href={bookingHref}
          className="inline-flex items-center justify-center gap-2 h-14 px-10 rounded-[40px] bg-primary text-primary-foreground font-heading font-semibold text-base hover:bg-primary/90 active:scale-[0.98] transition-all duration-200"
        >
          <Clock size={18} aria-hidden="true" />
          Book {fromCity.name} → {toCity.name} Now
        </Link>
      </div>
    </div>
  );
}
