import { Search, Car, UserCheck } from "lucide-react";

const STEPS = [
  {
    step: 1,
    icon: Search,
    title: "Tell Us Your Trip",
    description:
      "Enter your pickup city, destination, date, and time. We show you clear, fixed prices upfront — no hidden costs.",
  },
  {
    step: 2,
    icon: Car,
    title: "Choose Your Car",
    description:
      "Pick the vehicle that suits your group size and budget. Sedans, Ertiga, Innova, and more — all at fixed rates.",
  },
  {
    step: 3,
    icon: UserCheck,
    title: "Meet Your Verified Driver",
    description:
      "Your driver arrives on time. Background-verified, trained, and ready for a smooth, comfortable journey.",
  },
] as const;

export default function HowItWorks() {
  return (
    <section aria-labelledby="how-it-works-heading" className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4">
        <h2
          id="how-it-works-heading"
          className="font-heading font-semibold text-2xl md:text-3xl text-foreground text-center mb-10"
        >
          How AaoCab Works
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {STEPS.map(({ step, icon: Icon, title, description }) => (
            <div
              key={step}
              className="bg-card rounded-xl p-6 border border-border hover:shadow-md transition-shadow duration-200 flex flex-col gap-4"
            >
              {/* Step number circle */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-heading font-bold text-base flex-shrink-0"
                  aria-hidden="true"
                >
                  {step}
                </div>
                <Icon
                  size={24}
                  className="text-muted-foreground"
                  aria-hidden="true"
                />
              </div>

              <div>
                <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
