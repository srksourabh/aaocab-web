"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MapPin, ArrowRight, CalendarDays, Clock, ChevronDown } from "lucide-react";
import FarePreview from "@/components/FarePreview";
import PlacesAutocomplete, { type PlaceResult } from "@/components/PlacesAutocomplete";

// --- Types ---
type TripType = "outstation" | "local" | "airport";
type TransferType = "pickup" | "drop";

interface OutstationState {
  from: string;
  to: string;
  date: string;
  time: string;
  roundTrip: boolean;
  fromPlaceId?: string;
  fromLat?: number;
  fromLng?: number;
  toPlaceId?: string;
  toLat?: number;
  toLng?: number;
}

interface RouteDistance {
  distance_km: number;
  duration_minutes: number;
}

interface LocalState {
  city: string;
  date: string;
  time: string;
  pkg: string;
}

interface AirportState {
  airport: string;
  transferType: TransferType;
  date: string;
  time: string;
}

// --- Time slot generator (6:00 AM to 11:30 PM, 30-min intervals) ---
function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let hour = 6; hour <= 23; hour++) {
    for (const min of [0, 30]) {
      if (hour === 23 && min === 30) break;
      const period = hour < 12 ? "AM" : "PM";
      const displayHour = hour % 12 === 0 ? 12 : hour % 12;
      const displayMin = min === 0 ? "00" : "30";
      slots.push(`${displayHour}:${displayMin} ${period}`);
    }
  }
  return slots;
}

const TIME_SLOTS = generateTimeSlots();

const LOCAL_PACKAGES = [
  "4 hrs / 40 km",
  "8 hrs / 80 km",
  "12 hrs / 120 km",
];

const TAB_LABELS: { key: TripType; label: string }[] = [
  { key: "outstation", label: "Outstation" },
  { key: "local", label: "Local Rental" },
  { key: "airport", label: "Airport Transfer" },
];

// --- 4-hour validation helper ---
function getEarliestPickup(dateStr: string, timeStr: string): string | null {
  if (!dateStr || !timeStr) return null;

  const [datePart] = [dateStr];
  const [timePart, period] = timeStr.split(" ");
  const [h, m] = timePart.split(":").map(Number);
  let hours24 = h % 12;
  if (period === "PM") hours24 += 12;

  const [year, month, day] = datePart.split("-").map(Number);
  const selected = new Date(year, month - 1, day, hours24, m);
  const earliest = new Date(Date.now() + 4 * 60 * 60 * 1000);

  if (selected >= earliest) return null;

  const eh = earliest.getHours();
  const em = earliest.getMinutes();
  const epd = eh < 12 ? "AM" : "PM";
  const edh = eh % 12 === 0 ? 12 : eh % 12;
  const edm = em < 30 ? "00" : "30";
  const dateLabel = `${earliest.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  })}`;
  return `${dateLabel}, ${edh}:${edm} ${epd}`;
}

// --- Shared form field components ---
function TextInputField({
  icon: Icon,
  placeholder,
  value,
  onChange,
  label,
}: {
  icon: React.ElementType;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  return (
    <div className="relative">
      <label className="sr-only">{label}</label>
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
        <Icon size={18} aria-hidden="true" />
      </span>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-12 pl-10 pr-3 rounded-xl border border-border bg-background text-foreground text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200"
        aria-label={label}
      />
    </div>
  );
}

function DateField({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  const today = new Date().toISOString().split("T")[0];
  return (
    <div className="relative">
      <label className="sr-only">{label}</label>
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
        <CalendarDays size={18} aria-hidden="true" />
      </span>
      <input
        type="date"
        value={value}
        min={today}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-12 pl-10 pr-3 rounded-xl border border-border bg-background text-foreground text-base focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 cursor-pointer"
        aria-label={label}
      />
    </div>
  );
}

function SelectField({
  icon: Icon,
  options,
  value,
  onChange,
  placeholder,
  label,
}: {
  icon?: React.ElementType;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  label: string;
}) {
  return (
    <div className="relative">
      <label className="sr-only">{label}</label>
      {Icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
          <Icon size={18} aria-hidden="true" />
        </span>
      )}
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
        <ChevronDown size={16} aria-hidden="true" />
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full h-12 ${Icon ? "pl-10" : "pl-4"} pr-9 rounded-xl border border-border bg-background text-foreground text-base appearance-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 cursor-pointer`}
        aria-label={label}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

// --- 4-hour warning ---
function FourHourWarning({ earliest }: { earliest: string }) {
  return (
    <p
      role="alert"
      className="text-sm text-destructive font-medium mt-2 flex items-start gap-1.5"
    >
      <span aria-hidden="true">!</span>
      We need at least 4 hours to assign your driver. Earliest pickup:{" "}
      <span className="font-semibold">{earliest}</span>
    </p>
  );
}

// --- Tab: Outstation ---
function OutstationTab({
  state,
  onChange,
}: {
  state: OutstationState;
  onChange: (s: OutstationState) => void;
}) {
  const earliest = getEarliestPickup(state.date, state.time);

  function update<K extends keyof OutstationState>(key: K, value: OutstationState[K]) {
    onChange({ ...state, [key]: value });
  }

  function handleFromChange(result: PlaceResult | null, rawText: string) {
    onChange({
      ...state,
      from: rawText,
      fromPlaceId: result?.place_id,
      fromLat: result?.lat,
      fromLng: result?.lng,
    });
  }

  function handleToChange(result: PlaceResult | null, rawText: string) {
    onChange({
      ...state,
      to: rawText,
      toPlaceId: result?.place_id,
      toLat: result?.lat,
      toLng: result?.lng,
    });
  }

  return (
    <div className="space-y-3">
      <PlacesAutocomplete
        icon={MapPin}
        placeholder="Pickup city"
        value={state.from}
        onChange={handleFromChange}
        label="From city"
      />
      <PlacesAutocomplete
        icon={MapPin}
        placeholder="Drop city"
        value={state.to}
        onChange={handleToChange}
        label="To city"
      />
      <div className="grid grid-cols-2 gap-3">
        <DateField
          value={state.date}
          onChange={(v) => update("date", v)}
          label="Travel date"
        />
        <SelectField
          icon={Clock}
          options={TIME_SLOTS}
          value={state.time}
          onChange={(v) => update("time", v)}
          placeholder="Select time"
          label="Pickup time"
        />
      </div>

      {/* Round trip toggle */}
      <label className="flex items-center gap-3 cursor-pointer min-h-[44px] select-none">
        <span className="relative inline-flex items-center">
          <input
            type="checkbox"
            checked={state.roundTrip}
            onChange={(e) => update("roundTrip", e.target.checked)}
            className="sr-only peer"
            aria-label="Round trip"
          />
          <div className="w-11 h-6 bg-border rounded-full peer-checked:bg-primary transition-colors duration-200 peer-focus-visible:ring-2 peer-focus-visible:ring-ring" />
          <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 peer-checked:translate-x-5" />
        </span>
        <span className="text-sm font-medium text-foreground">Round Trip</span>
      </label>

      {earliest && <FourHourWarning earliest={earliest} />}
    </div>
  );
}

// --- Tab: Local Rental ---
function LocalTab({
  state,
  onChange,
}: {
  state: LocalState;
  onChange: (s: LocalState) => void;
}) {
  const earliest = getEarliestPickup(state.date, state.time);

  function update<K extends keyof LocalState>(key: K, value: LocalState[K]) {
    onChange({ ...state, [key]: value });
  }

  return (
    <div className="space-y-3">
      <TextInputField
        icon={MapPin}
        placeholder="Your city"
        value={state.city}
        onChange={(v) => update("city", v)}
        label="City"
      />
      <div className="grid grid-cols-2 gap-3">
        <DateField
          value={state.date}
          onChange={(v) => update("date", v)}
          label="Travel date"
        />
        <SelectField
          icon={Clock}
          options={TIME_SLOTS}
          value={state.time}
          onChange={(v) => update("time", v)}
          placeholder="Select time"
          label="Pickup time"
        />
      </div>
      <SelectField
        options={LOCAL_PACKAGES}
        value={state.pkg}
        onChange={(v) => update("pkg", v)}
        placeholder="Select package"
        label="Rental package"
      />
      {earliest && <FourHourWarning earliest={earliest} />}
    </div>
  );
}

// --- Tab: Airport Transfer ---
function AirportTab({
  state,
  onChange,
}: {
  state: AirportState;
  onChange: (s: AirportState) => void;
}) {
  const earliest = getEarliestPickup(state.date, state.time);

  function update<K extends keyof AirportState>(key: K, value: AirportState[K]) {
    onChange({ ...state, [key]: value });
  }

  return (
    <div className="space-y-3">
      <TextInputField
        icon={MapPin}
        placeholder="Airport name or city"
        value={state.airport}
        onChange={(v) => update("airport", v)}
        label="Airport"
      />

      {/* Transfer type radio */}
      <fieldset>
        <legend className="sr-only">Transfer type</legend>
        <div className="flex gap-4">
          {(
            [
              { value: "pickup", label: "Pickup from Airport" },
              { value: "drop", label: "Drop to Airport" },
            ] as const
          ).map(({ value, label }) => (
            <label
              key={value}
              className="flex items-center gap-2 cursor-pointer min-h-[44px] select-none"
            >
              <input
                type="radio"
                name="transferType"
                value={value}
                checked={state.transferType === value}
                onChange={() => update("transferType", value)}
                className="w-4 h-4 accent-primary cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <span className="text-sm font-medium text-foreground">{label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-2 gap-3">
        <DateField
          value={state.date}
          onChange={(v) => update("date", v)}
          label="Travel date"
        />
        <SelectField
          icon={Clock}
          options={TIME_SLOTS}
          value={state.time}
          onChange={(v) => update("time", v)}
          placeholder="Select time"
          label="Pickup time"
        />
      </div>

      {earliest && <FourHourWarning earliest={earliest} />}
    </div>
  );
}

// --- Initial values interface for NLP auto-fill ---
export interface BookingWidgetInitialValues {
  from?: string;
  to?: string;
  date?: string;
  time?: string; // HH:mm 24-hour
  roundTrip?: boolean;
}

/** Converts a 24-hour "HH:mm" string to the display format "H:MM AM/PM" used by TIME_SLOTS */
function toDisplayTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h < 12 ? "AM" : "PM";
  const displayH = h % 12 === 0 ? 12 : h % 12;
  const displayM = m === 0 ? "00" : "30"; // snap to nearest 30-min slot
  return `${displayH}:${displayM} ${period}`;
}

/** Finds the closest time slot available in TIME_SLOTS for a given 24-hour time. */
function findClosestTimeSlot(time: string): string {
  const display = toDisplayTime(time);
  return TIME_SLOTS.includes(display) ? display : TIME_SLOTS[0];
}

// --- Main BookingWidget ---
export default function BookingWidget({
  initialValues,
}: {
  initialValues?: BookingWidgetInitialValues;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TripType>("outstation");
  const tabListRef = useRef<HTMLDivElement>(null);

  // State lifted up so CTA button can read it
  const [outstationState, setOutstationState] = useState<OutstationState>({
    from: initialValues?.from ?? "",
    to: initialValues?.to ?? "",
    date: initialValues?.date ?? "",
    time:
      initialValues?.time ? findClosestTimeSlot(initialValues.time) : "",
    roundTrip: initialValues?.roundTrip ?? false,
  });
  const [localState, setLocalState] = useState<LocalState>({
    city: "",
    date: "",
    time: "",
    pkg: "",
  });
  const [airportState, setAirportState] = useState<AirportState>({
    airport: "",
    transferType: "pickup",
    date: "",
    time: "",
  });

  // Real distance fetched from Google Distance Matrix API
  const [routeDistance, setRouteDistance] = useState<RouteDistance | null>(null);
  const distanceDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchRouteDistance = useCallback(
    (fromPlaceId: string, toPlaceId: string) => {
      if (distanceDebounceRef.current) clearTimeout(distanceDebounceRef.current);
      distanceDebounceRef.current = setTimeout(async () => {
        try {
          const qs = new URLSearchParams({
            origin_place_id: fromPlaceId,
            destination_place_id: toPlaceId,
          });
          const res = await fetch(`/api/distance?${qs.toString()}`);
          if (!res.ok) {
            setRouteDistance(null);
            return;
          }
          const data = (await res.json()) as RouteDistance;
          setRouteDistance(data);
        } catch {
          setRouteDistance(null);
        }
      }, 500);
    },
    []
  );

  // Trigger distance fetch whenever both place IDs are present
  useEffect(() => {
    const { fromPlaceId, toPlaceId } = outstationState;
    if (fromPlaceId && toPlaceId) {
      fetchRouteDistance(fromPlaceId, toPlaceId);
    } else {
      setRouteDistance(null);
    }
  }, [outstationState.fromPlaceId, outstationState.toPlaceId, fetchRouteDistance]);

  // Sync outstation form when NLP fills in new values
  useEffect(() => {
    if (!initialValues) return;
    setOutstationState((prev) => ({
      ...prev,
      from: initialValues.from ?? prev.from,
      to: initialValues.to ?? prev.to,
      date: initialValues.date ?? prev.date,
      time: initialValues.time
        ? findClosestTimeSlot(initialValues.time)
        : prev.time,
      roundTrip: initialValues.roundTrip ?? prev.roundTrip,
    }));
    // Switch to outstation tab if NLP detected outstation fields
    if (initialValues.from || initialValues.to) {
      setActiveTab("outstation");
    }
  // Only fire when the initialValues reference changes (parent passes a new object)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues]);

  // Keyboard navigation for tabs
  function handleTabKeyDown(e: React.KeyboardEvent, currentIndex: number) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const next = (currentIndex + 1) % TAB_LABELS.length;
      setActiveTab(TAB_LABELS[next].key);
      (tabListRef.current?.querySelectorAll("[role=tab]")[next] as HTMLElement)?.focus();
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prev = (currentIndex - 1 + TAB_LABELS.length) % TAB_LABELS.length;
      setActiveTab(TAB_LABELS[prev].key);
      (tabListRef.current?.querySelectorAll("[role=tab]")[prev] as HTMLElement)?.focus();
    }
  }

  function handleGetPrices() {
    if (activeTab === "outstation") {
      const distanceValue = routeDistance
        ? String(Math.round(routeDistance.distance_km))
        : "200";
      const qs = new URLSearchParams({
        from: outstationState.from,
        to: outstationState.to,
        date: outstationState.date,
        time: outstationState.time,
        type: "outstation",
        roundTrip: String(outstationState.roundTrip),
        distance: distanceValue,
      });
      router.push(`/book?${qs.toString()}`);
    } else if (activeTab === "local") {
      const qs = new URLSearchParams({
        from: localState.city,
        to: localState.city,
        date: localState.date,
        time: localState.time,
        type: "local",
        roundTrip: "false",
        pkg: localState.pkg,
        distance: "80",
      });
      router.push(`/book?${qs.toString()}`);
    } else if (activeTab === "airport") {
      const qs = new URLSearchParams({
        from: airportState.airport,
        to: airportState.airport,
        date: airportState.date,
        time: airportState.time,
        type: "airport",
        roundTrip: "false",
        transferType: airportState.transferType,
        distance: "50",
      });
      router.push(`/book?${qs.toString()}`);
    }
  }

  return (
    <div className="bg-background rounded-2xl shadow-xl p-6 md:p-8 w-full">
      {/* Tab list */}
      <div
        role="tablist"
        aria-label="Trip type"
        ref={tabListRef}
        className="flex gap-1 bg-muted rounded-xl p-1 mb-6"
      >
        {TAB_LABELS.map(({ key, label }, index) => (
          <button
            key={key}
            role="tab"
            aria-selected={activeTab === key}
            aria-controls={`tabpanel-${key}`}
            id={`tab-${key}`}
            tabIndex={activeTab === key ? 0 : -1}
            onClick={() => setActiveTab(key)}
            onKeyDown={(e) => handleTabKeyDown(e, index)}
            className={`flex-1 py-2 px-3 text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[44px] ${
              activeTab === key
                ? "bg-background text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      <div
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
      >
        {activeTab === "outstation" && (
          <OutstationTab state={outstationState} onChange={setOutstationState} />
        )}
        {activeTab === "local" && (
          <LocalTab state={localState} onChange={setLocalState} />
        )}
        {activeTab === "airport" && (
          <AirportTab state={airportState} onChange={setAirportState} />
        )}
      </div>

      {/* Distance summary shown once Google calculates the real route */}
      {activeTab === "outstation" && routeDistance && (
        <p className="mt-3 text-sm text-muted-foreground text-center">
          <span className="font-semibold text-foreground">
            {routeDistance.distance_km} km
          </span>
          {" · ~"}
          <span className="font-semibold text-foreground">
            {routeDistance.duration_minutes >= 60
              ? `${Math.floor(routeDistance.duration_minutes / 60)} hrs${routeDistance.duration_minutes % 60 > 0 ? ` ${routeDistance.duration_minutes % 60} min` : ""}`
              : `${routeDistance.duration_minutes} min`}
          </span>
        </p>
      )}

      {/* Fare preview — only for outstation tab when both cities are filled */}
      {activeTab === "outstation" && (
        <div className="mt-4">
          <FarePreview
            from={outstationState.from}
            to={outstationState.to}
            distanceKm={routeDistance?.distance_km}
          />
        </div>
      )}

      {/* CTA */}
      <button
        type="button"
        onClick={handleGetPrices}
        className="mt-4 w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-heading font-semibold text-base rounded-[40px] h-14 md:h-12 hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label="Get cab prices"
      >
        Get Prices
        <ArrowRight size={20} aria-hidden="true" />
      </button>
    </div>
  );
}
