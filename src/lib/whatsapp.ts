/**
 * WhatsApp message template helpers for AaoCab.
 * Each function returns a plain-text message string.
 * Use whatsappLink() to convert it into a deep link.
 */

interface BookingForMessage {
  id: string;
  booking_number?: string;
  pickup_location: { city?: string };
  drop_location: { city?: string };
  pickup_datetime: string;
  total_fare: number;
}

interface DriverForMessage {
  name: string;
  phone: string;
}

function fmt(n: number): string {
  return n.toLocaleString("en-IN");
}

function formatDatetime(isoStr: string): string {
  if (!isoStr) return "";
  try {
    return new Date(isoStr).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return isoStr;
  }
}

function bookingNum(booking: BookingForMessage): string {
  return booking.booking_number ?? booking.id.slice(0, 8).toUpperCase();
}

/**
 * Message sent after a booking is confirmed.
 */
export function bookingConfirmationMessage(
  booking: BookingForMessage
): string {
  const from = booking.pickup_location?.city ?? "Pickup";
  const to = booking.drop_location?.city ?? "Drop";
  const num = bookingNum(booking);

  return [
    "Hi! I just booked a cab with AaoCab.",
    "",
    `Booking: ${num}`,
    `Route: ${from} → ${to}`,
    `Pickup: ${formatDatetime(booking.pickup_datetime)}`,
    `Total: ₹${fmt(booking.total_fare)}`,
    "",
    "Aao, Chalein! — aaocab.com",
  ].join("\n");
}

/**
 * Message sent once a driver is assigned to a booking.
 */
export function driverAssignedMessage(
  booking: BookingForMessage,
  driver: DriverForMessage
): string {
  const from = booking.pickup_location?.city ?? "Pickup";
  const to = booking.drop_location?.city ?? "Drop";
  const num = bookingNum(booking);

  return [
    "Your AaoCab driver has been assigned!",
    "",
    `Booking: ${num}`,
    `Route: ${from} → ${to}`,
    `Driver: ${driver.name}`,
    `Driver Phone: ${driver.phone}`,
    `Pickup: ${formatDatetime(booking.pickup_datetime)}`,
  ].join("\n");
}

/**
 * Message sharing the live trip tracking link.
 */
export function tripTrackingMessage(
  bookingId: string,
  from: string,
  to: string
): string {
  const trackUrl = `https://aaocab.com/track/${bookingId}`;

  return [
    `Track my AaoCab trip: ${from} → ${to}`,
    "",
    `Live tracking: ${trackUrl}`,
    "",
    "Powered by AaoCab — Aao, Chalein!",
  ].join("\n");
}

/**
 * Message asking the customer to leave a review after the trip.
 */
export function reviewRequestMessage(
  bookingId: string,
  driverName: string
): string {
  const reviewUrl = `https://aaocab.com/review/${bookingId}`;

  return [
    `How was your AaoCab trip with ${driverName}?`,
    "",
    `Leave a review here: ${reviewUrl}`,
    "",
    "Your feedback helps us serve you better.",
  ].join("\n");
}

/**
 * Generates a WhatsApp deep link for a given phone number and pre-filled message.
 * Phone should be in E.164 format without the + sign (e.g. "917890302302").
 */
export function whatsappLink(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
