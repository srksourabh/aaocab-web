"use client";

import { useState, useEffect, useRef } from "react";
import { Search, ArrowRight } from "lucide-react";
import { parseTrip, type ParsedTrip } from "@/lib/ai/nlp-search";
import { supabase } from "@/lib/supabase";

interface NLPSearchBarProps {
  onParsed: (result: ParsedTrip) => void;
}

function formatPreview(result: ParsedTrip): string {
  const parts: string[] = [];

  if (result.from && result.to) {
    parts.push(`${result.from} → ${result.to}`);
  } else if (result.from) {
    parts.push(result.from);
  }

  if (result.date) {
    const d = new Date(result.date + "T00:00:00");
    parts.push(
      d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
    );
  }

  if (result.time) {
    const [h, m] = result.time.split(":").map(Number);
    const period = h < 12 ? "AM" : "PM";
    const displayH = h % 12 === 0 ? 12 : h % 12;
    parts.push(`${displayH}:${String(m).padStart(2, "0")} ${period}`);
  }

  if (result.passengers) {
    parts.push(`${result.passengers} people`);
  }

  return parts.join(", ");
}

export default function NLPSearchBar({ onParsed }: NLPSearchBarProps) {
  const [query, setQuery] = useState("");
  const [cities, setCities] = useState<string[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [showLowConfidence, setShowLowConfidence] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch city list once on mount and cache in component state
  useEffect(() => {
    supabase
      .from("cities")
      .select("name")
      .then(({ data }) => {
        if (data) {
          setCities(data.map((c: { name: string }) => c.name));
        }
      });
  }, []);

  function handleSearch() {
    if (!query.trim()) return;

    const result = parseTrip(query, cities);

    if (result.confidence > 0.3) {
      setPreview(formatPreview(result));
      setShowLowConfidence(false);
      onParsed(result);
    } else {
      setPreview(null);
      setShowLowConfidence(true);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      handleSearch();
    }
  }

  return (
    <div className="w-full mb-4">
      <div className="relative flex items-center gap-2">
        {/* Search input */}
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            <Search size={18} aria-hidden="true" />
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPreview(null);
              setShowLowConfidence(false);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Try: Delhi to Agra tomorrow 6am"
            className="w-full h-12 pl-10 pr-4 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200"
            aria-label="Search your trip in plain language"
          />
        </div>

        {/* Search button */}
        <button
          type="button"
          onClick={handleSearch}
          className="h-12 px-4 rounded-xl bg-primary text-white font-semibold text-sm flex items-center gap-1.5 hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 shrink-0"
          aria-label="Search"
        >
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </div>

      {/* Result preview */}
      {preview && (
        <p
          role="status"
          aria-live="polite"
          className="mt-2 text-xs text-[#24B7A4] font-medium pl-1"
        >
          {preview}
        </p>
      )}

      {/* Low confidence feedback */}
      {showLowConfidence && (
        <p
          role="status"
          aria-live="polite"
          className="mt-2 text-xs text-muted-foreground pl-1"
        >
          Couldn&apos;t understand — try the form below
        </p>
      )}
    </div>
  );
}
