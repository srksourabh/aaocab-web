import { supabase } from "./supabase";
import type { DriverInfo, VehicleInfo } from "@/components/DriverCard";

/**
 * Fetches a single driver by ID from Supabase.
 * Returns DriverInfo shape or throws if not found.
 */
export async function getDriverById(id: string): Promise<DriverInfo> {
  const { data, error } = await supabase
    .from("drivers")
    .select("name, phone, photo_url, overall_rating, total_trips, on_time_percentage")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(`Failed to fetch driver: ${error.message}`);
  }

  return {
    name: data.name ?? "Driver",
    phone: data.phone ?? "",
    photo_url: data.photo_url ?? null,
    overall_rating: data.overall_rating ?? 0,
    total_trips: data.total_trips ?? 0,
    on_time_percentage: data.on_time_percentage ?? 0,
  };
}

/**
 * Fetches a single vehicle by ID from Supabase.
 * Returns VehicleInfo shape or throws if not found.
 */
export async function getVehicleById(id: string): Promise<VehicleInfo> {
  const { data, error } = await supabase
    .from("vehicles")
    .select("registration_number, make, model, year, color")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(`Failed to fetch vehicle: ${error.message}`);
  }

  return {
    registration_number: data.registration_number ?? "",
    make: data.make ?? "",
    model: data.model ?? "",
    year: data.year ?? new Date().getFullYear(),
    color: data.color ?? "",
  };
}
