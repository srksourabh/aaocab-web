"use client";

import { useState, useEffect } from "react";

type GoogleMapsStatus = "idle" | "loading" | "ready" | "error";

// Module-level flag so the script is only appended once per page load
let scriptStatus: GoogleMapsStatus = "idle";
// Listeners that want to know when the script finishes loading
const readyCallbacks: Array<(ready: boolean) => void> = [];

function loadGoogleMapsScript(apiKey: string): void {
  if (scriptStatus !== "idle") return;
  scriptStatus = "loading";

  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
  script.async = true;
  script.defer = true;

  script.onload = () => {
    scriptStatus = "ready";
    readyCallbacks.forEach((cb) => cb(true));
    readyCallbacks.length = 0;
  };

  script.onerror = () => {
    scriptStatus = "error";
    readyCallbacks.forEach((cb) => cb(false));
    readyCallbacks.length = 0;
  };

  document.head.appendChild(script);
}

/**
 * Loads the Google Maps JS SDK once and returns whether it is ready.
 * Multiple components can call this hook; the script is only fetched once.
 */
export function useGoogleMaps(): boolean {
  const [ready, setReady] = useState<boolean>(scriptStatus === "ready");

  useEffect(() => {
    if (scriptStatus === "ready") {
      setReady(true);
      return;
    }

    if (scriptStatus === "error") {
      return;
    }

    // Register a callback before triggering the load so we never miss the event
    const handleReady = (isReady: boolean) => setReady(isReady);
    readyCallbacks.push(handleReady);

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY ?? "";
    loadGoogleMapsScript(apiKey);

    return () => {
      const idx = readyCallbacks.indexOf(handleReady);
      if (idx !== -1) readyCallbacks.splice(idx, 1);
    };
  }, []);

  return ready;
}
