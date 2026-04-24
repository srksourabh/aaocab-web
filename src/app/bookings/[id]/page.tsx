import { Suspense } from "react";
import { getBooking } from "@/lib/booking";
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

  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <BookingDetailClient booking={booking} />
    </Suspense>
  );
}
