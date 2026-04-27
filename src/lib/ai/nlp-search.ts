/**
 * Natural Language Trip Parser
 *
 * Parses free-text trip queries (English/Hindi) into structured booking parameters.
 * Uses regex + fuzzy city matching. No external AI dependencies — ready for Claude API swap later.
 */

export interface ParsedTrip {
  from: string | null;
  to: string | null;
  date: string | null; // ISO date string YYYY-MM-DD
  time: string | null; // HH:mm
  passengers: number | null;
  vehicleType: string | null;
  roundTrip: boolean;
  confidence: number; // 0-1
}

// Common aliases for Indian cities
const CITY_ALIASES: Record<string, string> = {
  calcutta: "Kolkata",
  bombay: "Mumbai",
  madras: "Chennai",
  poona: "Pune",
  benares: "Varanasi",
  banaras: "Varanasi",
  bangaluru: "Bangalore",
  bengaluru: "Bangalore",
  gurgaon: "Gurugram",
  trivandrum: "Thiruvananthapuram",
  cochin: "Kochi",
  pondicherry: "Puducherry",
  mysuru: "Mysore",
  shimoga: "Shivamogga",
  mangaluru: "Mangalore",
  vizag: "Visakhapatnam",
  alleppey: "Alappuzha",
  ooty: "Ooty",
  calicut: "Kozhikode",
};

// Vehicle keywords mapped to vehicle slugs
const VEHICLE_KEYWORDS: Record<string, string> = {
  sedan: "sedan",
  swift: "sedan",
  dzire: "sedan",
  etios: "sedan",
  ertiga: "ertiga",
  innova: "innova",
  crysta: "crysta",
  "innova crysta": "crysta",
  "12 seater": "12-seater",
  "12-seater": "12-seater",
  "tempo traveller": "12-seater",
  tempo: "12-seater",
  "16 seater": "16-seater",
  "16-seater": "16-seater",
  bus: "16-seater",
  minibus: "16-seater",
};

/**
 * Fuzzy-match a user token against the available cities list.
 * Returns the best match or null if nothing is close enough.
 */
function fuzzyMatchCity(
  token: string,
  availableCities: string[]
): string | null {
  const lower = token.toLowerCase().trim();
  if (!lower) return null;

  // Check aliases first
  const alias = CITY_ALIASES[lower];
  if (alias) {
    const match = availableCities.find(
      (c) => c.toLowerCase() === alias.toLowerCase()
    );
    if (match) return match;
  }

  // Exact match (case-insensitive)
  const exact = availableCities.find((c) => c.toLowerCase() === lower);
  if (exact) return exact;

  // Starts-with match
  const startsWith = availableCities.find((c) =>
    c.toLowerCase().startsWith(lower)
  );
  if (startsWith) return startsWith;

  // Contains match (token length must be >= 3 to avoid false positives)
  if (lower.length >= 3) {
    const contains = availableCities.find((c) =>
      c.toLowerCase().includes(lower)
    );
    if (contains) return contains;

    // Reverse contains: city name appears in the token
    const reverseContains = availableCities.find((c) =>
      lower.includes(c.toLowerCase())
    );
    if (reverseContains) return reverseContains;
  }

  return null;
}

/**
 * Parses a date-related token into an ISO date string.
 * Handles: "today", "tomorrow", "next saturday", "May 10", "10/05/2026", etc.
 */
function parseDate(query: string): string | null {
  const lower = query.toLowerCase();
  const now = new Date();

  if (/\btoday\b/.test(lower)) {
    return toISODate(now);
  }

  if (/\btomorrow\b|\bkal\b/.test(lower)) {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    return toISODate(d);
  }

  // "next <day>" or just a day name
  const dayNames = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const dayMatch = lower.match(
    /\b(?:next\s+)?(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/
  );
  if (dayMatch) {
    const targetDay = dayNames.indexOf(dayMatch[1]);
    const currentDay = now.getDay();
    let daysAhead = targetDay - currentDay;
    if (daysAhead <= 0) daysAhead += 7;
    if (dayMatch[0].startsWith("next") && daysAhead <= 7) {
      // "next saturday" when today is saturday should be 7 days ahead, not today
    }
    const d = new Date(now);
    d.setDate(d.getDate() + daysAhead);
    return toISODate(d);
  }

  // "May 10" or "10 May" or "May 10, 2026"
  const months = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ];
  const monthShort = [
    "jan",
    "feb",
    "mar",
    "apr",
    "may",
    "jun",
    "jul",
    "aug",
    "sep",
    "oct",
    "nov",
    "dec",
  ];

  for (let i = 0; i < months.length; i++) {
    const monthPattern = new RegExp(
      `\\b(${months[i]}|${monthShort[i]})\\s+(\\d{1,2})(?:,?\\s+(\\d{4}))?\\b`,
      "i"
    );
    const match = lower.match(monthPattern);
    if (match) {
      const year = match[3] ? parseInt(match[3]) : now.getFullYear();
      const day = parseInt(match[2]);
      const d = new Date(year, i, day);
      if (!isNaN(d.getTime())) return toISODate(d);
    }

    // "10 May" format
    const reversePattern = new RegExp(
      `\\b(\\d{1,2})\\s+(${months[i]}|${monthShort[i]})(?:\\s+(\\d{4}))?\\b`,
      "i"
    );
    const reverseMatch = lower.match(reversePattern);
    if (reverseMatch) {
      const year = reverseMatch[3]
        ? parseInt(reverseMatch[3])
        : now.getFullYear();
      const day = parseInt(reverseMatch[1]);
      const d = new Date(year, i, day);
      if (!isNaN(d.getTime())) return toISODate(d);
    }
  }

  // DD/MM/YYYY or DD-MM-YYYY
  const dateSlash = lower.match(/\b(\d{1,2})[/-](\d{1,2})[/-](\d{4})\b/);
  if (dateSlash) {
    const d = new Date(
      parseInt(dateSlash[3]),
      parseInt(dateSlash[2]) - 1,
      parseInt(dateSlash[1])
    );
    if (!isNaN(d.getTime())) return toISODate(d);
  }

  return null;
}

function toISODate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Extracts time from a query string.
 * Handles: "6am", "6:00 am", "18:00", "6 PM", "morning", "evening"
 */
function parseTime(query: string): string | null {
  const lower = query.toLowerCase();

  // "6am", "6 am", "6:00am", "6:30 pm"
  const timeMatch = lower.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1]);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
    const period = timeMatch[3];
    if (period === "pm" && hours < 12) hours += 12;
    if (period === "am" && hours === 12) hours = 0;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }

  // 24-hour format "18:00"
  const time24 = lower.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
  if (time24) {
    return `${String(parseInt(time24[1])).padStart(2, "0")}:${time24[2]}`;
  }

  // Named times
  if (/\bmorning\b|\bsubah\b/.test(lower)) return "08:00";
  if (/\bafternoon\b|\bdopahar\b/.test(lower)) return "13:00";
  if (/\bevening\b|\bshaam\b/.test(lower)) return "17:00";
  if (/\bnight\b|\braat\b/.test(lower)) return "20:00";

  return null;
}

/**
 * Extracts passenger count from query.
 */
function parsePassengers(query: string): number | null {
  const lower = query.toLowerCase();

  const match = lower.match(
    /\b(\d{1,2})\s*(?:people|persons?|passengers?|pax|log|logon)\b/
  );
  if (match) return parseInt(match[1]);

  // "for 4" pattern
  const forMatch = lower.match(/\bfor\s+(\d{1,2})\b/);
  if (forMatch) return parseInt(forMatch[1]);

  return null;
}

/**
 * Detects vehicle type from query.
 */
function parseVehicleType(query: string): string | null {
  const lower = query.toLowerCase();

  for (const [keyword, slug] of Object.entries(VEHICLE_KEYWORDS)) {
    if (lower.includes(keyword)) return slug;
  }

  return null;
}

/**
 * Detects if the trip is a round trip.
 */
function parseRoundTrip(query: string): boolean {
  const lower = query.toLowerCase();
  return /\b(round\s*trip|return|both\s*ways|wapas|wapsi|aana\s*jaana)\b/.test(
    lower
  );
}

/**
 * Extracts from/to cities from the query using patterns like:
 * - "Delhi to Agra"
 * - "Delhi se Agra"
 * - "cab from Mumbai to Pune"
 * - "Kolkata Digha" (two consecutive city names)
 */
function parseCities(
  query: string,
  availableCities: string[]
): { from: string | null; to: string | null } {
  const lower = query.toLowerCase();

  // Pattern: "from X to Y" or "X to Y" or "X se Y" or "X - Y"
  const toPattern =
    /(?:from\s+)?(.+?)\s+(?:to|se|->|-->|→)\s+(.+?)(?:\s+(?:tomorrow|today|next|on|at|for|\d).*)?$/i;
  const toMatch = lower.match(toPattern);

  if (toMatch) {
    const fromToken = toMatch[1]
      .replace(/^(?:cab|car|taxi|book|need|want|get)\s+(?:from\s+)?/i, "")
      .trim();
    const toToken = toMatch[2]
      .replace(
        /\s+(?:tomorrow|today|next|on|at|for|round|return|morning|evening|night|\d).*/i,
        ""
      )
      .trim();

    const from = fuzzyMatchCity(fromToken, availableCities);
    const to = fuzzyMatchCity(toToken, availableCities);

    if (from || to) return { from, to };
  }

  // Pattern: "airport pickup Delhi" or "airport drop Kolkata"
  const airportMatch = lower.match(
    /\bairport\s+(?:pickup|drop|transfer)\s+(\w+)/
  );
  if (airportMatch) {
    const city = fuzzyMatchCity(airportMatch[1], availableCities);
    if (city) return { from: city, to: null };
  }

  // Fallback: look for any two known cities in the query
  const words = query.split(/\s+/);
  const foundCities: string[] = [];

  // Try multi-word city names first (e.g., "New Delhi")
  for (let i = 0; i < words.length - 1; i++) {
    const twoWord = `${words[i]} ${words[i + 1]}`;
    const match = fuzzyMatchCity(twoWord, availableCities);
    if (match && !foundCities.includes(match)) {
      foundCities.push(match);
    }
  }

  // Then try single words
  for (const word of words) {
    const stripped = word.replace(/[^a-zA-Z]/g, "");
    if (stripped.length < 3) continue;
    const match = fuzzyMatchCity(stripped, availableCities);
    if (match && !foundCities.includes(match)) {
      foundCities.push(match);
    }
  }

  if (foundCities.length >= 2) {
    return { from: foundCities[0], to: foundCities[1] };
  }
  if (foundCities.length === 1) {
    return { from: foundCities[0], to: null };
  }

  return { from: null, to: null };
}

/**
 * Main parser: converts a natural language trip query into structured booking parameters.
 *
 * @param query - Free-text input from the user (English or Hindi)
 * @param availableCities - List of city names from the database
 * @returns Parsed trip with confidence score
 */
export function parseTrip(
  query: string,
  availableCities: string[]
): ParsedTrip {
  if (!query || !query.trim()) {
    return {
      from: null,
      to: null,
      date: null,
      time: null,
      passengers: null,
      vehicleType: null,
      roundTrip: false,
      confidence: 0,
    };
  }

  const { from, to } = parseCities(query, availableCities);
  const date = parseDate(query);
  const time = parseTime(query);
  const passengers = parsePassengers(query);
  const vehicleType = parseVehicleType(query);
  const roundTrip = parseRoundTrip(query);

  // Calculate confidence based on what was parsed
  let score = 0;
  let maxScore = 0;

  // From and To are the most important fields
  maxScore += 3;
  if (from) score += 1.5;
  if (to) score += 1.5;

  // Date and time are helpful
  maxScore += 1;
  if (date) score += 0.5;
  if (time) score += 0.5;

  // Optional fields add a bit
  maxScore += 1;
  if (passengers) score += 0.33;
  if (vehicleType) score += 0.33;
  if (roundTrip) score += 0.34;

  const confidence = maxScore > 0 ? Math.round((score / maxScore) * 100) / 100 : 0;

  return {
    from,
    to,
    date,
    time,
    passengers,
    vehicleType,
    roundTrip,
    confidence,
  };
}
