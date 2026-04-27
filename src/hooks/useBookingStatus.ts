"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { DriverInfo, VehicleInfo } from "@/components/DriverCard";

export interface BookingStatusState {
  status: string;
  assignedDriver: DriverInfo | null;
  assignedVehicle: VehicleInfo | null;
  loading: boolean;
}

/**
 * Subscribes to real-time changes on a booking row via Supabase Realtime.
 * When the status changes to 'driver_assigned', automatically fetches
 * the assigned driver and vehicle details.
 */
export function useBookingStatus(
  bookingId: string,
  initialStatus: string
): BookingStatusState {
  const [status, setStatus] = useState<string>(initialStatus);
  const [assignedDriver, setAssignedDriver] = useState<DriverInfo | null>(null);
  const [assignedVehicle, setAssignedVehicle] = useState<VehicleInfo | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch driver and vehicle details when a driver is assigned
  async function fetchDriverAndVehicle(
    driverId: string,
    vehicleId: string
  ): Promise<void> {
    setLoading(true);
    try {
      const [driverResult, vehicleResult] = await Promise.all([
        supabase
          .from("drivers")
          .select(
            "name, phone, photo_url, overall_rating, total_trips, on_time_percentage"
          )
          .eq("id", driverId)
          .single(),
        supabase
          .from("vehicles")
          .select("registration_number, make, model, year, color")
          .eq("id", vehicleId)
          .single(),
      ]);

      if (driverResult.data) {
        setAssignedDriver({
          name: driverResult.data.name ?? "Driver",
          phone: driverResult.data.phone ?? "",
          photo_url: driverResult.data.photo_url ?? null,
          overall_rating: driverResult.data.overall_rating ?? 0,
          total_trips: driverResult.data.total_trips ?? 0,
          on_time_percentage: driverResult.data.on_time_percentage ?? 0,
        });
      }

      if (vehicleResult.data) {
        setAssignedVehicle({
          registration_number: vehicleResult.data.registration_number ?? "",
          make: vehicleResult.data.make ?? "",
          model: vehicleResult.data.model ?? "",
          year: vehicleResult.data.year ?? new Date().getFullYear(),
          color: vehicleResult.data.color ?? "",
        });
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!bookingId) return;

    // Subscribe to changes on this specific booking row
    const channel = supabase
      .channel(`booking-status-${bookingId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "bookings",
          filter: `id=eq.${bookingId}`,
        },
        (payload) => {
          const newRecord = payload.new as {
            status?: string;
            assigned_driver_id?: string | null;
            assigned_vehicle_id?: string | null;
          };

          if (newRecord.status) {
            setStatus(newRecord.status);
          }

          // When driver is assigned, fetch their details
          if (
            newRecord.status === "driver_assigned" &&
            newRecord.assigned_driver_id &&
            newRecord.assigned_vehicle_id
          ) {
            fetchDriverAndVehicle(
              newRecord.assigned_driver_id,
              newRecord.assigned_vehicle_id
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [bookingId]);

  return { status, assignedDriver, assignedVehicle, loading };
}
