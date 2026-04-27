import Image from "next/image";
import { Users } from "lucide-react";

const VEHICLES = [
  {
    name: "Sedan",
    seats: 4,
    price: "₹2,000",
    description: "Swift Dzire, Etios — ideal for 4 passengers",
    image: "/images/cab-sedan.jpg",
  },
  {
    name: "Ertiga",
    seats: 6,
    price: "₹2,800",
    description: "Comfortable MPV for families and groups",
    image: "/images/cab-sedan.jpg",
  },
  {
    name: "Innova",
    seats: 7,
    price: "₹3,500",
    description: "Premium 7-seater for longer journeys",
    image: "/images/cab-innova.jpg",
  },
  {
    name: "Innova Crysta",
    seats: 7,
    price: "₹4,000",
    description: "Upgraded comfort with extra legroom",
    image: "/images/cab-fortuner.jpg",
  },
  {
    name: "12-Seater",
    seats: 12,
    price: "₹5,000",
    description: "Tempo traveller for large groups",
    image: "/images/cab-fortuner.jpg",
  },
] as const;

export default function VehicleCategories() {
  return (
    <section aria-labelledby="our-fleet-heading" className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4">
        <h2
          id="our-fleet-heading"
          className="font-heading font-semibold text-2xl md:text-3xl text-foreground mb-8"
        >
          Our Fleet
        </h2>

        {/* Horizontal scroll on mobile, 3-col grid on desktop */}
        <div className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible scrollbar-hide">
          {VEHICLES.map(({ name, seats, price, description, image }) => (
            <div
              key={name}
              className="flex-shrink-0 w-64 md:w-auto bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              <div className="relative h-36 w-full">
                <Image
                  src={image}
                  alt={name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 256px, 33vw"
                />
              </div>

              {/* Card body */}
              <div className="p-4 flex flex-col gap-2">
                <h3 className="font-heading font-semibold text-base text-foreground">
                  {name}
                </h3>
                <p className="text-xs text-muted-foreground leading-snug">
                  {description}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users size={14} aria-hidden="true" />
                    {seats} seats
                  </span>
                  <span className="font-bold text-primary text-sm">
                    From {price}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
