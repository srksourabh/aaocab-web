import { ArrowRight } from "lucide-react";

const ROUTES = [
  { from: "Delhi", to: "Agra", price: "₹2,800", distance: "233 km" },
  { from: "Delhi", to: "Jaipur", price: "₹3,200", distance: "282 km" },
  { from: "Mumbai", to: "Pune", price: "₹2,200", distance: "149 km" },
  { from: "Bangalore", to: "Mysore", price: "₹1,800", distance: "143 km" },
  { from: "Hyderabad", to: "Vijayawada", price: "₹3,500", distance: "275 km" },
  { from: "Chennai", to: "Pondicherry", price: "₹1,600", distance: "150 km" },
  { from: "Delhi", to: "Chandigarh", price: "₹2,900", distance: "243 km" },
  { from: "Kolkata", to: "Digha", price: "₹2,400", distance: "184 km" },
] as const;

function toSlug(city: string) {
  return city.toLowerCase().replace(/\s+/g, "-");
}

export default function PopularRoutes() {
  return (
    <section aria-labelledby="popular-routes-heading" className="py-12 md:py-16 bg-muted">
      <div className="max-w-7xl mx-auto px-4">
        <h2
          id="popular-routes-heading"
          className="font-heading font-semibold text-2xl md:text-3xl text-foreground mb-8"
        >
          Popular Routes
        </h2>

        {/* Horizontal scroll on mobile, 4-col grid on desktop */}
        <div className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:overflow-visible scrollbar-hide">
          {ROUTES.map(({ from, to, price, distance }) => {
            const href = `/cabs/${toSlug(from)}-to-${toSlug(to)}`;
            return (
              <a
                key={`${from}-${to}`}
                href={href}
                aria-label={`Book cab from ${from} to ${to}, starting ${price}`}
                className="flex-shrink-0 w-52 md:w-auto bg-card rounded-xl p-4 border border-border hover:border-primary transition-all duration-200 cursor-pointer flex flex-col gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {/* Route */}
                <div className="flex items-center gap-2 font-heading font-semibold text-base text-foreground">
                  <span>{from}</span>
                  <ArrowRight size={16} className="text-muted-foreground flex-shrink-0" aria-hidden="true" />
                  <span>{to}</span>
                </div>

                {/* Details */}
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-bold text-primary">From {price}</p>
                  <p className="text-xs text-muted-foreground">{distance}</p>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
