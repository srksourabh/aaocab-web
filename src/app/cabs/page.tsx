import type { Metadata } from "next";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Book Cabs Across India | AaoCab",
  description:
    "Browse all cities where AaoCab operates. Pre-booked cab service with fixed fares, verified drivers, and no surge pricing across 30+ cities in India.",
  openGraph: {
    title: "Book Cabs Across India | AaoCab",
    description:
      "Pre-booked cab service across 30+ Indian cities. Fixed fares, no surge pricing.",
    type: "website",
  },
};

interface City {
  id: string;
  name: string;
  slug: string;
  state: string;
}

interface RouteCount {
  from_city_id: string;
}

export default async function CabsIndexPage() {
  const { data: cities } = await supabase
    .from("cities")
    .select("id, name, slug, state")
    .order("name", { ascending: true });

  const { data: routes } = await supabase
    .from("routes")
    .select("from_city_id");

  // Count routes departing from each city
  const routeCountMap: Record<string, number> = {};
  (routes ?? []).forEach((r: RouteCount) => {
    routeCountMap[r.from_city_id] = (routeCountMap[r.from_city_id] ?? 0) + 1;
  });

  const cityList: City[] = cities ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 md:py-16">
      <header className="mb-10">
        <h1 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-3">
          Book Cabs Across India
        </h1>
        <p className="text-muted-foreground text-base max-w-2xl">
          AaoCab operates across {cityList.length} cities. Fixed fares, verified
          drivers, no surge pricing — ever.
        </p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {cityList.map((city) => {
          const routeCount = routeCountMap[city.id] ?? 0;
          return (
            <Link
              key={city.slug}
              href={`/cabs/${city.slug}`}
              className="group flex flex-col gap-2 rounded-xl border border-border bg-card p-4 hover:border-primary hover:shadow-md transition-all duration-200"
            >
              <span className="flex items-center gap-1.5 text-primary">
                <MapPin size={16} aria-hidden="true" />
              </span>
              <span className="font-heading font-semibold text-sm text-foreground group-hover:text-primary transition-colors duration-150">
                {city.name}
              </span>
              <span className="text-xs text-muted-foreground">{city.state}</span>
              {routeCount > 0 && (
                <span className="text-xs text-muted-foreground">
                  {routeCount} route{routeCount > 1 ? "s" : ""}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
