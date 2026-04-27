import Link from "next/link";
import { Users } from "lucide-react";

export interface FareRow {
  vehicle: string;
  vehicleSlug: string;
  capacity: number;
  price: number;
  popular?: boolean;
}

interface FareTableProps {
  fares: FareRow[];
  bookingHref?: string;
}

/**
 * Displays estimated fares per vehicle type.
 * On mobile: stacked cards. On desktop: a table.
 */
export default function FareTable({ fares, bookingHref = "/book" }: FareTableProps) {
  return (
    <div>
      {/* Mobile: card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
        {fares.map((row) => (
          <div
            key={row.vehicleSlug}
            className={`relative rounded-xl border p-4 flex flex-col gap-3 ${
              row.popular
                ? "border-primary bg-primary/5"
                : "border-border bg-card"
            }`}
          >
            {row.popular && (
              <span className="absolute top-3 right-3 text-[10px] font-heading font-semibold bg-primary text-primary-foreground px-2 py-0.5 rounded-full uppercase tracking-wide">
                Most Popular
              </span>
            )}
            <div>
              <p className="font-heading font-semibold text-base text-foreground">
                {row.vehicle}
              </p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <Users size={12} aria-hidden="true" />
                {row.capacity} seats
              </p>
            </div>
            <p className="font-bold text-xl text-primary">
              ₹{row.price.toLocaleString("en-IN")}
            </p>
            <Link
              href={bookingHref}
              className="inline-flex items-center justify-center h-10 px-4 rounded-[40px] bg-primary text-primary-foreground text-sm font-heading font-semibold hover:bg-primary/90 transition-colors duration-200"
            >
              Book Now
            </Link>
          </div>
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left px-5 py-3 font-heading font-semibold text-foreground">
                Vehicle
              </th>
              <th className="text-left px-5 py-3 font-heading font-semibold text-foreground">
                Capacity
              </th>
              <th className="text-left px-5 py-3 font-heading font-semibold text-foreground">
                Est. Fare
              </th>
              <th className="px-5 py-3" aria-hidden="true" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {fares.map((row) => (
              <tr
                key={row.vehicleSlug}
                className={row.popular ? "bg-primary/5" : ""}
              >
                <td className="px-5 py-4">
                  <span className="font-heading font-semibold text-foreground">
                    {row.vehicle}
                  </span>
                  {row.popular && (
                    <span className="ml-2 text-[10px] font-heading font-semibold bg-primary text-primary-foreground px-2 py-0.5 rounded-full uppercase tracking-wide">
                      Most Popular
                    </span>
                  )}
                </td>
                <td className="px-5 py-4 text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Users size={14} aria-hidden="true" />
                    {row.capacity}
                  </span>
                </td>
                <td className="px-5 py-4 font-bold text-primary text-base">
                  ₹{row.price.toLocaleString("en-IN")}
                </td>
                <td className="px-5 py-4 text-right">
                  <Link
                    href={bookingHref}
                    className="inline-flex items-center justify-center h-9 px-5 rounded-[40px] bg-primary text-primary-foreground text-sm font-heading font-semibold hover:bg-primary/90 transition-colors duration-200"
                  >
                    Book Now
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
