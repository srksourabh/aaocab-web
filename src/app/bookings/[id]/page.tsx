import { Suspense } from "react";
import { getBooking } from "@/lib/booking";
import { getDriverById, getVehicleById } from "@/lib/drivers";
import BookingDetailClient from "./BookingDetailClient";
import { notFound } from "next/navigation";

export default async function BookingDetailPage({
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

  // Fetch driver and vehicle if assigned
  let driver = null;
  let vehicle = null;

  if (booking.assigned_driver_id) {
    try {
      driver = await getDriverById(booking.assigned_driver_id);
    } catch {
      // Driver fetch failed — show placeholder
    }
  }

  if (booking.assigned_vehicle_id) {
    try {
      vehicle = await getVehicleById(booking.assigned_vehicle_id);
    } catch {
      // Vehicle fetch failed — show placeholder
    }
  }

  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <BookingDetailClient
        booking={booking}
        driver={driver}
        vehicle={vehicle}
      />
    </Suspense>
  );
}
