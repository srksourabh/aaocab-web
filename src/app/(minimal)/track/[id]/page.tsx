import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBooking } from "@/lib/booking";
import { getDriverById, getVehicleById } from "@/lib/drivers";
import TrackingClient from "./TrackingClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  let from = "Pickup";
  let to = "Drop";

  try {
    const booking = await getBooking(id);
    from = booking?.pickup_location?.city ?? from;
    to = booking?.drop_location?.city ?? to;
  } catch {
    // Best-effort metadata
  }

  return {
    title: "Track Your AaoCab Trip",
    description: `Track your AaoCab cab journey from ${from} to ${to} in real time.`,
  };
}

export default async function TrackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let booking = null;
  try {
    booking = await getBooking(id);
  } catch {
    notFound();
  }

  if (!booking) notFound();

  let driver = null;
  let vehicle = null;

  if (booking.assigned_driver_id) {
    try {
      driver = await getDriverById(booking.assigned_driver_id);
    } catch {
      // Driver fetch failed — continue without
    }
  }

  if (booking.assigned_vehicle_id) {
    try {
      vehicle = await getVehicleById(booking.assigned_vehicle_id);
    } catch {
      // Vehicle fetch failed — continue without
    }
  }

  return (
    <TrackingClient booking={booking} driver={driver} vehicle={vehicle} />
  );
}
