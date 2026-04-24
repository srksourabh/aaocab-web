import { Suspense } from "react";
import { getAllBookings } from "@/lib/booking";
import BookingsListClient from "./BookingsListClient";

export default async function BookingsPage() {
  let bookings: Record<string, unknown>[] = [];
  try {
    bookings = await getAllBookings();
  } catch {
    // If fetch fails, render with empty list
    bookings = [];
  }

  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <BookingsListClient bookings={bookings} />
    </Suspense>
  );
}
