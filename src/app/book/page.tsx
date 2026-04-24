import { Suspense } from "react";
import { supabase } from "@/lib/supabase";
import CarSelectionClient from "./CarSelectionClient";

// Server Component: awaits searchParams (Next.js 15 requirement) and fetches vehicle categories
export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  const from = (params.from as string) ?? "";
  const to = (params.to as string) ?? "";
  const date = (params.date as string) ?? "";
  const time = (params.time as string) ?? "";
  const type = (params.type as string) ?? "outstation";
  const roundTrip = (params.roundTrip as string) ?? "false";
  const distanceKm = parseInt((params.distance as string) ?? "200", 10);

  // Fetch vehicle categories from Supabase, sorted by display order
  const { data: categories } = await supabase
    .from("vehicle_categories")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <CarSelectionClient
        from={from}
        to={to}
        date={date}
        time={time}
        type={type}
        roundTrip={roundTrip}
        distanceKm={distanceKm}
        categories={categories ?? []}
      />
    </Suspense>
  );
}
