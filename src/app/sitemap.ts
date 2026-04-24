import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

const BASE_URL = "https://aaocab.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ data: cities }, { data: routes }, { data: airports }] =
    await Promise.all([
      supabase.from("cities").select("slug, updated_at"),
      supabase.from("routes").select("slug, updated_at"),
      supabase.from("airports").select("slug, updated_at"),
    ]);

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/cabs`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/safety`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  // City pages
  const cityPages: MetadataRoute.Sitemap = (cities ?? []).map((city) => ({
    url: `${BASE_URL}/cabs/${city.slug}`,
    lastModified: city.updated_at ? new Date(city.updated_at) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Route pages (highest priority — most search volume)
  const routePages: MetadataRoute.Sitemap = (routes ?? []).map((route) => ({
    url: `${BASE_URL}/cabs/${route.slug}`,
    lastModified: route.updated_at ? new Date(route.updated_at) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  // Airport taxi pages
  const airportPages: MetadataRoute.Sitemap = (airports ?? []).map((airport) => ({
    url: `${BASE_URL}/cabs/${airport.slug}-taxi`,
    lastModified: airport.updated_at ? new Date(airport.updated_at) : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...cityPages, ...routePages, ...airportPages];
}
