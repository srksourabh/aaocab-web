import { Clock, MapPin, Info, Backpack } from "lucide-react";

interface TripPlannerProps {
  from: string;
  to: string;
  distanceKm: number;
  durationMinutes: number;
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h} hr ${m} min`;
  if (h > 0) return `${h} hr`;
  return `${m} min`;
}

function getPackingTips(distanceKm: number): string {
  if (distanceKm <= 150) {
    return "Keep water and light snacks handy. A power bank for your phone is useful. Comfortable clothing recommended for a shorter ride.";
  }
  if (distanceKm <= 400) {
    return "Pack water, snacks, and a light jacket for AC comfort. Bring a neck pillow for a comfortable journey. Keep your ID and booking confirmation accessible.";
  }
  return "Pack sufficient water, snacks, and a blanket or jacket. Bring travel pillows for a long journey. Plan at least one rest stop. Keep essentials in an easy-access bag.";
}

function getStopsContent(from: string, to: string, distanceKm: number): string {
  if (distanceKm <= 100) {
    return `The ${from} to ${to} route is short enough for a non-stop drive. Your driver can suggest local dhabas near the highway if you need a quick chai break.`;
  }
  if (distanceKm <= 300) {
    return `Plan one comfortable stop midway between ${from} and ${to}. Your driver knows good highway dhabas and fuel stops along this route. Ask them for recommendations.`;
  }
  return `For the ${from} to ${to} journey, plan at least two breaks. Midway petrol stations and highway restaurants offer clean facilities. Your driver will suggest the best halt points.`;
}

function getTollInfo(distanceKm: number): string {
  if (distanceKm <= 80) return "This route typically has minimal or no toll charges.";
  if (distanceKm <= 200) return "Expect 1–2 toll plazas. Carry ₹100–200 in cash or use FASTag if your vehicle is equipped.";
  return "Multiple toll plazas along this highway route. Carry ₹300–600 in cash or use FASTag. Your driver can advise the exact toll amount.";
}

interface PlanCard {
  icon: React.ElementType;
  title: string;
  content: string;
}

export default function TripPlanner({
  from,
  to,
  distanceKm,
  durationMinutes,
}: TripPlannerProps) {
  const durationLabel = formatDuration(durationMinutes);

  const cards: PlanCard[] = [
    {
      icon: Clock,
      title: "Best Time to Travel",
      content: `Leave ${from} by 6 AM to reach ${to} before afternoon and avoid midday traffic. Early morning starts also mean cooler temperatures and lighter highway traffic on most routes.`,
    },
    {
      icon: MapPin,
      title: "Popular Stops",
      content: getStopsContent(from, to, distanceKm),
    },
    {
      icon: Info,
      title: "Things to Know",
      content: `Distance: ${distanceKm} km · Drive time: ${durationLabel}. ${getTollInfo(distanceKm)} All AaoCab fares are fixed at booking — no surge pricing applies mid-route.`,
    },
    {
      icon: Backpack,
      title: "What to Pack",
      content: getPackingTips(distanceKm),
    },
  ];

  return (
    <section aria-labelledby="trip-planner-heading" className="mb-12">
      <h2
        id="trip-planner-heading"
        className="font-heading font-semibold text-xl md:text-2xl text-foreground mb-6"
      >
        Plan Your Trip
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map(({ icon: Icon, title, content }) => (
          <div
            key={title}
            className="rounded-xl border border-border bg-card p-5 flex flex-col gap-3"
          >
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                <Icon size={16} className="text-primary" aria-hidden="true" />
              </span>
              <h3 className="font-heading font-semibold text-sm text-foreground">
                {title}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {content}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
