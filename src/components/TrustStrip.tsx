import { Shield, CalendarCheck, UserCheck, Car } from "lucide-react";

const TRUST_ITEMS = [
  {
    icon: Shield,
    label: "No Hidden Charges",
  },
  {
    icon: CalendarCheck,
    label: "Free Cancellation 24hr",
  },
  {
    icon: UserCheck,
    label: "Verified Drivers",
  },
  {
    icon: Car,
    label: "12,400+ Trips Completed",
  },
] as const;

export default function TrustStrip() {
  return (
    <section
      aria-label="Why trust AaoCab"
      className="bg-muted py-6"
    >
      <div className="max-w-7xl mx-auto px-4">
        <ul className="grid grid-cols-2 md:grid-cols-4 gap-4 list-none">
          {TRUST_ITEMS.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex items-center gap-3"
            >
              <span className="flex-shrink-0" aria-hidden="true">
                <Icon size={24} className="text-accent" />
              </span>
              <span className="text-sm font-medium text-foreground leading-snug">
                {label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
