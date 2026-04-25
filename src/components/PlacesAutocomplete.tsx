"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type ElementType,
} from "react";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";

export interface PlaceResult {
  description: string;
  place_id: string;
  lat: number;
  lng: number;
}

interface Props {
  icon?: ElementType;
  label: string;
  placeholder: string;
  value: string;
  onChange: (result: PlaceResult | null, rawText: string) => void;
}

export default function PlacesAutocomplete({
  icon: Icon,
  label,
  placeholder,
  value,
  onChange,
}: Props) {
  const mapsReady = useGoogleMaps();
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<
    google.maps.places.AutocompletePrediction[]
  >([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const autocompleteServiceRef =
    useRef<google.maps.places.AutocompleteService | null>(null);
  // PlacesService needs a DOM node to attach to but we never display its map
  const placesServiceNodeRef = useRef<HTMLDivElement | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync external value resets (e.g. NLP auto-fill)
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Initialise Google services once the SDK is loaded
  useEffect(() => {
    if (!mapsReady) return;
    autocompleteServiceRef.current =
      new google.maps.places.AutocompleteService();
    if (placesServiceNodeRef.current) {
      placesServiceRef.current = new google.maps.places.PlacesService(
        placesServiceNodeRef.current
      );
    }
  }, [mapsReady]);

  const fetchSuggestions = useCallback(
    (text: string) => {
      if (!autocompleteServiceRef.current || text.trim().length < 2) {
        setSuggestions([]);
        setOpen(false);
        return;
      }

      autocompleteServiceRef.current.getPlacePredictions(
        {
          input: text,
          componentRestrictions: { country: "in" },
          types: ["(cities)"],
        },
        (predictions, status) => {
          if (
            status === google.maps.places.PlacesServiceStatus.OK &&
            predictions
          ) {
            setSuggestions(predictions);
            setOpen(true);
            setActiveIndex(-1);
          } else {
            setSuggestions([]);
            setOpen(false);
          }
        }
      );
    },
    []
  );

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const text = e.target.value;
    setInputValue(text);

    // Clear previous selection when user edits
    onChange(null, text);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(text), 300);
  }

  function selectSuggestion(
    prediction: google.maps.places.AutocompletePrediction
  ) {
    if (!placesServiceRef.current) return;

    setInputValue(prediction.description);
    setSuggestions([]);
    setOpen(false);

    placesServiceRef.current.getDetails(
      { placeId: prediction.place_id, fields: ["geometry"] },
      (place, status) => {
        if (
          status === google.maps.places.PlacesServiceStatus.OK &&
          place?.geometry?.location
        ) {
          onChange(
            {
              description: prediction.description,
              place_id: prediction.place_id,
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            },
            prediction.description
          );
        }
      }
    );
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  function handleBlur() {
    // Delay so click on suggestion fires first
    setTimeout(() => setOpen(false), 150);
  }

  return (
    <div className="relative">
      {/* Hidden node required by PlacesService */}
      <div ref={placesServiceNodeRef} aria-hidden="true" className="hidden" />

      <label className="sr-only">{label}</label>
      {Icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
          <Icon size={18} aria-hidden="true" />
        </span>
      )}
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-controls="places-listbox"
        aria-activedescendant={
          activeIndex >= 0 ? `places-option-${activeIndex}` : undefined
        }
        aria-label={label}
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={() => {
          if (suggestions.length > 0) setOpen(true);
        }}
        className={`w-full h-12 ${Icon ? "pl-10" : "pl-3"} pr-3 rounded-xl border border-border bg-background text-foreground text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200`}
      />

      {open && suggestions.length > 0 && (
        <ul
          id="places-listbox"
          role="listbox"
          aria-label={`${label} suggestions`}
          className="absolute z-50 top-full mt-1 w-full bg-background border border-border rounded-xl shadow-lg overflow-hidden"
        >
          {suggestions.map((prediction, idx) => (
            <li
              key={prediction.place_id}
              id={`places-option-${idx}`}
              role="option"
              aria-selected={idx === activeIndex}
              onMouseDown={() => selectSuggestion(prediction)}
              className={`min-h-[44px] flex items-center px-4 py-2.5 cursor-pointer text-sm text-foreground transition-colors duration-100 ${
                idx === activeIndex
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-muted"
              }`}
            >
              {prediction.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
