import BookingWidget from "@/components/BookingWidget";

export default function HeroSection() {
  return (
    <section
      aria-label="Book a cab"
      className="min-h-[calc(100vh-64px)] md:min-h-0 md:py-16 flex items-start md:items-center"
      style={{
        background: "linear-gradient(135deg, var(--primary-light) 0%, #ffffff 60%)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 w-full py-10 md:py-0">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Headlines */}
          <div className="flex flex-col gap-4">
            <h1 className="font-heading font-bold text-4xl md:text-5xl text-foreground leading-tight tracking-tight">
              Aao, Chalein!
            </h1>
            <p className="text-lg text-muted-foreground font-sans leading-relaxed max-w-md">
              Pre-booked car rental.{" "}
              <span className="text-foreground font-semibold">No surge.</span>{" "}
              <span className="text-foreground font-semibold">No surprises.</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Available across 500+ cities in India
            </p>
          </div>

          {/* Booking widget */}
          <div className="w-full">
            <BookingWidget />
          </div>
        </div>
      </div>
    </section>
  );
}
