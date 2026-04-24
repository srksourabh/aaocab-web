import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import CityPage from "./CityPage";
import RoutePage from "./RoutePage";
import AirportPage from "./AirportPage";
import {
  generateCityDescription,
  generateRouteDescription,
  estimateFareForVehicle,
} from "@/lib/seo";

// Typical distance for "starting from" price on city/airport pages
const CITY_ESTIMATE_KM = 100;

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Determines what type of SEO page to render based on the slug pattern:
 * - "kolkata-airport-taxi"  → airport page
 * - "delhi-to-agra"         → route page
 * - "kolkata"               → city page
 */
function classifySlug(slug: string): "airport" | "route" | "city" {
  if (slug.endsWith("-airport-taxi")) return "airport";
  if (slug.includes("-to-")) return "route";
  return "city";
}

export async function generateStaticParams() {
  const [{ data: cities }, { data: routes }, { data: airports }] =
    await Promise.all([
      supabase.from("cities").select("slug"),
      supabase.from("routes").select("slug"),
      supabase.from("airports").select("slug"),
    ]);

  const cityParams = (cities ?? []).map((c) => ({ slug: c.slug }));
  const routeParams = (routes ?? []).map((r) => ({ slug: r.slug }));
  // Airport slugs are stored as e.g. "kolkata-airport" — we append "-taxi"
  const airportParams = (airports ?? []).map((a) => ({
    slug: `${a.slug}-taxi`,
  }));

  return [...cityParams, ...routeParams, ...airportParams];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const type = classifySlug(slug);

  if (type === "city") {
    const { data: city } = await supabase
      .from("cities")
      .select("name")
      .eq("slug", slug)
      .single();
    if (!city) return { title: "Not Found | AaoCab" };
    const price = estimateFareForVehicle(CITY_ESTIMATE_KM, "sedan");
    const innoPrice = estimateFareForVehicle(CITY_ESTIMATE_KM, "innova");
    return {
      title: `Cab Rental in ${city.name} | AaoCab - Starting ₹${price.toLocaleString("en-IN")}`,
      description: generateCityDescription(city.name, 8, price),
      openGraph: {
        title: `Cab Rental in ${city.name} | AaoCab`,
        description: `Sedan from ₹${price.toLocaleString("en-IN")}, Innova from ₹${innoPrice.toLocaleString("en-IN")}. Fixed fares, no surge.`,
        type: "website",
      },
    };
  }

  if (type === "route") {
    const { data: route } = await supabase
      .from("routes")
      .select(
        "distance_km, duration_minutes, from_city:cities!routes_from_city_id_fkey(name), to_city:cities!routes_to_city_id_fkey(name)"
      )
      .eq("slug", slug)
      .single();
    if (!route) return { title: "Not Found | AaoCab" };
    const fromCity = route.from_city as unknown as { name: string } | null;
    const toCity = route.to_city as unknown as { name: string } | null;
    const from = fromCity?.name ?? "";
    const to = toCity?.name ?? "";
    const price = estimateFareForVehicle(route.distance_km, "sedan");
    return {
      title: `${from} to ${to} Cab - ₹${price.toLocaleString("en-IN")} | AaoCab`,
      description: generateRouteDescription(from, to, route.distance_km, price),
      openGraph: {
        title: `${from} to ${to} Cab | AaoCab`,
        description: `Starting ₹${price.toLocaleString("en-IN")}. ${route.distance_km} km journey.`,
        type: "website",
      },
    };
  }

  // Airport
  const airportSlug = slug.replace(/-taxi$/, "");
  const { data: airport } = await supabase
    .from("airports")
    .select("name, code, city:cities(name)")
    .eq("slug", airportSlug)
    .single();
  if (!airport) return { title: "Not Found | AaoCab" };
  const cityName = (airport.city as unknown as { name: string } | null)?.name ?? "";
  const price = estimateFareForVehicle(40, "sedan");
  return {
    title: `${airport.name} Taxi & Cab Service | AaoCab - From ₹${price.toLocaleString("en-IN")}`,
    description: `Book a taxi for ${airport.name} (${airport.code}) in ${cityName}. Fixed airport transfer fares with flight-tracking. No hidden charges.`,
    openGraph: {
      title: `${airport.name} Taxi | AaoCab`,
      description: `Airport cab from ₹${price.toLocaleString("en-IN")} with flight tracking.`,
      type: "website",
    },
  };
}

export default async function CabSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const type = classifySlug(slug);

  if (type === "city") {
    return <CityPage slug={slug} />;
  }

  if (type === "route") {
    return <RoutePage slug={slug} />;
  }

  // Airport: strip the "-taxi" suffix to get the stored airport slug
  const airportSlug = slug.replace(/-taxi$/, "");
  return <AirportPage slug={airportSlug} />;
}
