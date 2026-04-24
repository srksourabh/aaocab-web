"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Phone, Mail, MapPin, MessageSquare } from "lucide-react";

interface Props {
  from: string;
  to: string;
  date: string;
  time: string;
  type: string;
  roundTrip: string;
  distance: string;
  vehicleCategoryId: string;
  vehicleSlug: string;
  vehicleName: string;
  totalFare: string;
  baseFare: string;
  driverAllowance: string;
  toll: string;
  gst: string;
  advanceAmount: string;
}

interface FormState {
  name: string;
  phone: string;
  email: string;
  pickupAddress: string;
  specialRequests: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  pickupAddress?: string;
}

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!form.name.trim()) errors.name = "Full name is required";
  if (!form.phone.trim()) {
    errors.phone = "Phone number is required";
  } else if (!/^\d{10}$/.test(form.phone.replace(/\s/g, ""))) {
    errors.phone = "Enter a valid 10-digit phone number";
  }
  if (!form.pickupAddress.trim())
    errors.pickupAddress = "Pickup address is required";
  return errors;
}

// --- Booking Summary Card ---
function BookingSummary({
  from,
  to,
  date,
  time,
  vehicleName,
  totalFare,
  roundTrip,
}: {
  from: string;
  to: string;
  date: string;
  time: string;
  vehicleName: string;
  totalFare: string;
  roundTrip: string;
}) {
  const formattedDate = date
    ? new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";
  const isRound = roundTrip === "true";

  return (
    <div className="bg-primary/5 border border-primary/15 rounded-2xl p-4 space-y-2">
      <p className="font-heading font-semibold text-foreground">
        {from} → {to}
      </p>
      <p className="text-sm text-muted-foreground">
        {formattedDate}
        {time ? `, ${time}` : ""} · {isRound ? "Round Trip" : "One-way"}
      </p>
      <div className="flex items-center justify-between pt-1">
        <p className="text-sm text-foreground">{vehicleName}</p>
        <p className="font-heading font-bold text-primary text-lg">
          ₹{parseInt(totalFare, 10).toLocaleString("en-IN")}
        </p>
      </div>
    </div>
  );
}

// --- Labeled Field Wrapper ---
function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-foreground">{label}</label>
      {children}
      {error && (
        <p role="alert" className="text-xs text-destructive font-medium">
          {error}
        </p>
      )}
    </div>
  );
}

// --- Input with Icon ---
function IconInput({
  icon: Icon,
  prefix,
  ...props
}: {
  icon: React.ElementType;
  prefix?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative flex items-center">
      <span className="absolute left-3 text-muted-foreground pointer-events-none">
        <Icon size={16} aria-hidden="true" />
      </span>
      {prefix && (
        <span className="absolute left-9 text-sm text-muted-foreground font-medium pointer-events-none select-none">
          {prefix}
        </span>
      )}
      <input
        {...props}
        className={`w-full h-12 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 ${prefix ? "pl-16" : "pl-10"} pr-4`}
      />
    </div>
  );
}

// --- Textarea with Icon ---
function IconTextarea({
  icon: Icon,
  ...props
}: {
  icon: React.ElementType;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-3 text-muted-foreground pointer-events-none">
        <Icon size={16} aria-hidden="true" />
      </span>
      <textarea
        {...props}
        rows={3}
        className="w-full pl-10 pr-4 pt-3 pb-3 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 resize-none"
      />
    </div>
  );
}

// --- Main Component ---
export default function PassengerDetailsClient({
  from,
  to,
  date,
  time,
  type,
  roundTrip,
  distance,
  vehicleCategoryId,
  vehicleSlug,
  vehicleName,
  totalFare,
  baseFare,
  driverAllowance,
  toll,
  gst,
  advanceAmount,
}: Props) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
    email: "",
    pickupAddress: "",
    specialRequests: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  function update(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (touched.has(field)) {
      const newErrors = validate({ ...form, [field]: value });
      setErrors((prev) => ({ ...prev, [field]: newErrors[field as keyof FormErrors] }));
    }
  }

  function touch(field: string) {
    const next = new Set(touched);
    next.add(field);
    setTouched(next);
    const newErrors = validate(form);
    setErrors((prev) => ({ ...prev, [field]: newErrors[field as keyof FormErrors] }));
  }

  function handleSubmit() {
    const allErrors = validate(form);
    setErrors(allErrors);
    setTouched(new Set(["name", "phone", "pickupAddress"]));
    if (Object.keys(allErrors).length > 0) return;

    const qs = new URLSearchParams({
      from,
      to,
      date,
      time,
      type,
      roundTrip,
      distance,
      vehicleCategoryId,
      vehicleSlug,
      vehicleName,
      totalFare,
      baseFare,
      driverAllowance,
      toll,
      gst,
      advanceAmount,
      passengerName: form.name.trim(),
      passengerPhone: form.phone.trim(),
      passengerEmail: form.email.trim(),
      pickupAddress: form.pickupAddress.trim(),
      specialRequests: form.specialRequests.trim(),
    });
    router.push(`/book/payment?${qs.toString()}`);
  }

  function handleBack() {
    const qs = new URLSearchParams({
      from,
      to,
      date,
      time,
      type,
      roundTrip,
      distance,
    });
    router.push(`/book?${qs.toString()}`);
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Back */}
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          aria-label="Back to car selection"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back
        </button>

        <div>
          <h1 className="font-heading font-bold text-2xl text-foreground">
            Passenger Details
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tell us who&apos;s travelling so we can assign the right driver.
          </p>
        </div>

        {/* Booking summary */}
        <BookingSummary
          from={from}
          to={to}
          date={date}
          time={time}
          vehicleName={vehicleName}
          totalFare={totalFare}
          roundTrip={roundTrip}
        />

        {/* Form */}
        <div className="space-y-4">
          <Field label="Full Name *" error={errors.name}>
            <IconInput
              icon={User}
              type="text"
              placeholder="Your full name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              onBlur={() => touch("name")}
              autoComplete="name"
              aria-label="Full name"
              aria-required="true"
              aria-invalid={!!errors.name}
            />
          </Field>

          <Field label="Phone Number *" error={errors.phone}>
            <IconInput
              icon={Phone}
              prefix="+91"
              type="tel"
              inputMode="tel"
              placeholder="10-digit mobile number"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
              onBlur={() => touch("phone")}
              autoComplete="tel"
              aria-label="Phone number"
              aria-required="true"
              aria-invalid={!!errors.phone}
            />
          </Field>

          <Field label="Email (optional)">
            <IconInput
              icon={Mail}
              type="email"
              placeholder="For booking confirmation"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              autoComplete="email"
              aria-label="Email address"
            />
          </Field>

          <Field label="Full Pickup Address *" error={errors.pickupAddress}>
            <div className="relative">
              <span className="absolute left-3 top-3 text-muted-foreground pointer-events-none">
                <MapPin size={16} aria-hidden="true" />
              </span>
              <textarea
                rows={3}
                placeholder="Enter full address for driver — include landmark, flat/house no."
                value={form.pickupAddress}
                onChange={(e) => update("pickupAddress", e.target.value)}
                onBlur={() => touch("pickupAddress")}
                aria-label="Full pickup address"
                aria-required="true"
                aria-invalid={!!errors.pickupAddress}
                className="w-full pl-10 pr-4 pt-3 pb-3 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 resize-none"
              />
            </div>
          </Field>

          <Field label="Special Requests (optional)">
            <IconTextarea
              icon={MessageSquare}
              placeholder="e.g., Need child seat, early morning flight"
              value={form.specialRequests}
              onChange={(e) => update("specialRequests", e.target.value)}
              aria-label="Special requests"
            />
          </Field>
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full h-14 md:h-12 bg-primary text-white font-heading font-semibold text-base rounded-[40px] hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Confirm &amp; Pay
        </button>

        <p className="text-xs text-center text-muted-foreground">
          Your details are safe with us and used only for trip coordination.
        </p>
      </div>
    </div>
  );
}
