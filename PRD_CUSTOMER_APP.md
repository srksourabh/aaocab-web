# AaoCab Customer Web App — Product Requirements Document

**Version**: 1.1
**Date**: April 24, 2026
**Author**: Sourabh Bhaumik, CEO
**Status**: Draft for Review

> **Design Language**: See `DEVELOPMENT_PLAN.md` (Part 1: Design Language) for complete color system, typography, component specs, logo usage, and 21st.dev component selections.
> **Development Roadmap**: See `DEVELOPMENT_PLAN.md` (Part 3: Customer App roadmap) for week-by-week execution plan.

---

## 1. Product Overview

### What We're Building
A production-grade, AI-powered customer booking website for AaoCab — India's pre-booked car rental aggregator. This is NOT a ride-hailing app. Every trip is planned at least 4 hours in advance, with verified drivers, inspected vehicles, and transparent pricing.

### Why We're Building It
The current live site is a basic Softgen-generated booking form. It has no SEO presence, no AI features, no price transparency, and no trust-building elements. We need a platform that:
- Ranks on Google for "Delhi to Agra cab," "Kolkata airport taxi," and 500+ similar searches
- Converts visitors into bookings in under 60 seconds on mobile
- Feels premium and trustworthy to users aged 24-60
- Uses AI where it genuinely improves the experience (not as a buzzword)
- Differentiates AaoCab from Savaari, Ola Outstation, and every other cab aggregator

### Who Uses It
- **Primary**: Semi-tech-savvy Indians (25-60 years old) who prefer phone/WhatsApp but will use a clean website
- **Secondary**: Tech-savvy professionals (24-35) booking work trips, weekend getaways, airport transfers
- **Tertiary**: Families (40-60) booking outstation trips, pilgrimages, group travel

### Business Model
- Customer pays AaoCab. AaoCab pays vendor (minus 20-25% commission).
- 10-30% advance payment at booking. Balance paid to driver at trip end.
- Revenue target: 400-500 trips/month by Year 2 at average INR 4,500/trip

---

## 2. Core Principles

| Principle | What It Means |
|-----------|--------------|
| **Price-first, not price-hidden** | Show the all-inclusive fare before asking for a name or account. Every rupee visible — base, tolls, driver allowance, GST. No checkout surprises. |
| **60-second mobile booking** | Trip details → Car selection → Passenger info → Payment. 4 screens maximum. |
| **Trust before transaction** | Driver photo + rating + verified badge shown before payment. Safety features visible above the fold. |
| **AI that helps, not hypes** | Every AI feature must answer: "What would happen without AI here?" If the answer is "nothing much," don't build it. |
| **SEO as a growth engine** | Every city, route, and airport gets a dedicated landing page. Content is unique, not templated junk. |
| **Accessible to all ages** | 56px buttons, 16px+ body text, bottom navigation, no hamburger menus, WhatsApp as the comfort channel. |

---

## 3. Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 15 (App Router) | SSR for SEO, React Server Components for performance |
| Language | TypeScript | Type safety across the full stack |
| Styling | Tailwind CSS + shadcn/ui | Consistent design system, Radix primitives for accessibility |
| Database | Supabase (PostgreSQL 17) | Shared with Vendor App and Admin Panel. Project: `zpjmblpjrkudxjburund` |
| Auth | Supabase Auth | Phone OTP login (no password), Google OAuth optional |
| Payments | Razorpay | UPI-first, cards, netbanking. 10-30% advance payment model |
| Maps | Google Maps Platform | Places API (autocomplete), Distance Matrix (fare calc), Geocoding |
| AI — NLP | Claude API (Haiku 4.5) | Natural language search, WhatsApp bot, review analysis |
| AI — Vision | Claude Vision (Sonnet 4.6) | Pre-trip car photo quality scoring |
| AI — OCR | Google Document AI | Document parsing for vendor onboarding (shared with Vendor App) |
| Scraping | Playwright (headless) | Competitor price monitoring |
| WhatsApp | Gupshup / Twilio | WhatsApp Business API for booking confirmations + chatbot |
| Hosting | Vercel | Auto-deploy from GitHub, edge functions, image optimization |
| Analytics | PostHog (self-hosted) or Mixpanel | Funnel tracking, A/B testing, session replay |
| Monitoring | Sentry | Error tracking, performance monitoring |

---

## 4. Information Architecture

### 4.1 Page Map

```
/ (Homepage)
├── /book (Booking Flow)
│   ├── /book/outstation
│   ├── /book/local-rental
│   └── /book/airport-transfer
│
├── /cabs (SEO Landing Pages — Dynamic Templates)
│   ├── /cabs/[city] (City Pages — e.g., /cabs/kolkata)
│   ├── /cabs/[from]-to-[to] (Route Pages — e.g., /cabs/delhi-to-agra)
│   ├── /cabs/[city]-airport-taxi (Airport Pages)
│   ├── /cabs/[city]-railway-station-taxi (Railway Pages)
│   └── /cabs/[city]/[vehicle-type] (City + Vehicle — e.g., /cabs/kolkata/innova)
│
├── /prices (Pricing Pages — SEO + Transparency)
│   ├── /prices/[from]-to-[to] (Route Fare Tables)
│   └── /prices/[city]-local-rental (City Rental Rates)
│
├── /track/[booking-id] (Trip Tracking — Public Link)
│
├── /my-bookings (Authenticated)
│   ├── /my-bookings/[id] (Booking Detail)
│   └── /my-bookings/[id]/invoice (Downloadable Invoice)
│
├── /account (User Profile)
│   ├── /account/profile
│   ├── /account/saved-places
│   └── /account/payment-methods
│
├── /about
├── /safety
├── /careers
├── /blog
├── /contact
├── /terms
├── /privacy
└── /refund-policy
```

### 4.2 SEO Landing Page Strategy

**Why this matters**: Savaari gets 70%+ of their traffic from route-specific SEO pages. This is the single most important growth lever for AaoCab.

**Page Templates (5 types, generated from database)**:

| Template | URL Pattern | Example | Estimated Pages |
|----------|------------|---------|----------------|
| City Page | `/cabs/[city]` | `/cabs/kolkata` | 50+ |
| Route Page | `/cabs/[from]-to-[to]` | `/cabs/delhi-to-agra` | 500+ |
| Airport Page | `/cabs/[city]-airport-taxi` | `/cabs/kolkata-airport-taxi` | 30+ |
| Railway Page | `/cabs/[city]-railway-station-taxi` | `/cabs/kolkata-howrah-station-taxi` | 30+ |
| Vehicle + City | `/cabs/[city]/[vehicle]` | `/cabs/mumbai/innova` | 200+ |

**Each page contains (auto-generated + CMS-editable)**:
- Booking widget (pre-filled with the page's city/route)
- Fare table (pulled from pricing engine, updated daily)
- Competitor price comparison ("AaoCab vs Savaari vs Ola for this route")
- Travel information (distance, duration, toll estimates, best time to travel)
- Popular stops/attractions along the route
- Real customer reviews for that specific route/city
- FAQ section (structured data for Google rich snippets)
- Related routes ("People also book: Delhi to Jaipur, Delhi to Manali")

**Content generation**: Use Claude API to generate unique, factual descriptions for each route. Human review for top 50 pages. Automated for the long tail.

---

## 5. Feature Specifications

### 5.1 Homepage

**Purpose**: Convert visitors into bookings. Secondary: build brand trust.

**Layout (Mobile-First)**:

```
┌─────────────────────────────┐
│  AaoCab Logo    EN|HI  ☎   │  ← Sticky header with language toggle + tap-to-call
├─────────────────────────────┤
│                             │
│   "Aao, Chalein!"          │
│   Pre-booked car rental.    │
│   No surge. No surprises.   │
│                             │
│  ┌─────────────────────┐   │
│  │ ○ Outstation ○ City │   │  ← Trip type tabs
│  │   ○ Airport         │   │
│  │                     │   │
│  │ From: [Kolkata    ] │   │  ← Google Places autocomplete
│  │ To:   [Delhi      ] │   │
│  │ Date: [Apr 28     ] │   │
│  │ Time: [09:00 AM   ] │   │
│  │                     │   │
│  │ [  Get Prices  🚗 ] │   │  ← Primary CTA, 56px, #4F4ED6
│  └─────────────────────┘   │
│                             │
│  ✅ No hidden charges       │  ← Trust strip (horizontal scroll)
│  ✅ Free cancellation 24hr  │
│  ✅ Verified drivers         │
│  ✅ 12,400+ trips completed │
│                             │
├─────────────────────────────┤
│  "How AaoCab Works"        │
│  1. Tell us your trip       │
│  2. Choose your car         │
│  3. Meet your verified      │
│     driver                  │
├─────────────────────────────┤
│  Popular Routes             │
│  [Delhi→Agra] [Mum→Pune]   │  ← Cards linking to route SEO pages
│  [Kol→Digha] [Blr→Mysore]  │
├─────────────────────────────┤
│  Our Fleet                  │
│  [Sedan] [Ertiga] [Innova]  │  ← Vehicle category cards with starting prices
│  [12-Seat] [16-Seat]        │
├─────────────────────────────┤
│  Real Reviews               │
│  ⭐ 4.8 "Driver was on      │  ← City-specific reviews, not generic
│  time, car was spotless"    │
│  — Priya, Kolkata→Digha    │
├─────────────────────────────┤
│  AI Trip Planner            │
│  "Need a car from Delhi to  │  ← NLP search box
│   Agra next Saturday for    │
│   4 people"                 │
│  [ Plan My Trip → ]         │
├─────────────────────────────┤
│  Cities We Serve            │
│  [Kolkata] [Delhi] [Mumbai] │  ← Grid linking to city SEO pages
│  [Bangalore] [Hyderabad]... │
├─────────────────────────────┤
│  Footer                     │
│  About | Safety | Blog      │
│  Terms | Privacy | Refund   │
│  ☎ 7890 302 302             │
│  📱 WhatsApp Us             │
└─────────────────────────────┘
│ 🏠 Home | 📋 Bookings | 💬 Help | 👤 Profile │  ← Bottom nav (mobile)
```

### 5.2 Booking Flow (4 Screens)

**Screen 1: Trip Details** (Homepage widget or `/book`)
- Trip type: Outstation / City Rental / Airport Transfer
- Pickup location (Google Places autocomplete)
- Drop location (for outstation/airport) OR rental hours (for city)
- Date picker (calendar, not text field)
- Time picker (dropdown, 30-min intervals)
- **4-hour constraint validation**: If pickup is <4 hours away, show inline message immediately: "We need at least 4 hours to assign your driver. Earliest pickup: [auto-calculated time]." Do NOT let users reach payment and discover this.
- Round trip toggle (for outstation)
- "Get Prices" button → proceeds to Screen 2

**Screen 2: Car Selection**
- Cards sorted by price (low to high)
- Each card shows:
  - Car category image (real photo, not illustration)
  - Category name (Sedan, Ertiga, Innova, etc.)
  - **All-inclusive price** (bold, large) — base + toll estimate + driver allowance + GST
  - "What's included?" expandable: fuel, AC, 24/7 support, X km included, extra km rate
  - Seating capacity icon
  - "Most Popular" / "Best Value" badge on top option
- **Competitor price strip**: "AaoCab: ₹3,200 | Savaari: ₹3,500 | Ola: ₹3,800" — pulled from scraping engine
- Select button → Screen 3

**Screen 3: Passenger Details**
- Name (pre-filled if logged in)
- Phone number (mandatory — this is how driver contacts the customer)
- Email (optional)
- Pickup address (full address, not just city)
- Special requests (text field — e.g., "need child seat," "early morning flight")
- Login/signup via phone OTP (if not already logged in)
- "Confirm & Pay" button → Screen 4

**Screen 4: Payment**
- Order summary: route, car type, date/time, total fare
- Fare breakdown (visible by default on this screen)
- **Payment options** (ordered by preference):
  1. UPI (PhonePe, GPay, Paytm — shown as icon buttons)
  2. Credit/Debit Card
  3. Netbanking
- **Advance payment selector**: "Pay ₹640 now (20%) — balance ₹2,560 to driver" OR "Pay full ₹3,200 now"
- Cancellation policy summary: "Free cancellation up to 24 hours before pickup"
- "Pay & Book" button
- On success → Booking confirmation screen + WhatsApp confirmation sent automatically

### 5.3 Booking Confirmation & Post-Booking

**Confirmation Screen**:
- Booking ID (large, copyable)
- Trip summary (from, to, date, time, car type)
- "Booking confirmed" animation (subtle checkmark, under 300ms)
- Driver assignment status: "Finding your driver" progress indicator → updates to driver profile card when assigned
- **Driver Profile Card** (shown 2-4 hours before pickup):
  - Real photo of driver
  - Full name
  - Rating (4.7★, 312 trips)
  - Verified badge (shield icon in Teal #24B7A4): "Aadhaar verified, police-checked"
  - Vehicle info: White Toyota Innova, KA-01-AB-1234
  - Real photo of the actual vehicle (not stock)
- Action buttons:
  - "Share on WhatsApp" (pre-populated message with booking details)
  - "Download Invoice"
  - "Call Support: 7890 302 302"
  - "Cancel Booking"

**WhatsApp Notifications** (automated via WhatsApp Business API):
1. Booking confirmed — immediately after payment
2. Driver assigned — with driver name, photo, phone number
3. Driver en route — 2 hours before pickup, with live tracking link
4. Trip started — with estimated arrival time
5. Trip completed — with fare summary + feedback link
6. Invoice — downloadable PDF

### 5.4 AI-Powered Features

#### 5.4.1 Natural Language Trip Search
**What**: User types "I need a car from Delhi to Agra next Saturday for 4 people" in a search box on the homepage.
**How**: Send the text to Claude Haiku API with a system prompt that extracts structured JSON: `{from, to, date, passengers, vehicle_type_suggestion}`. Feed JSON into the booking flow, pre-filling all fields.
**Cost**: ~₹0.08 per query (~$0.001)
**Fallback**: If extraction fails or confidence is low, fall back to the standard form fields.
**Why it's real AI**: Handles variations like "Agra trip Saturday 4 log" (Hinglish), "airport pickup tomorrow 6am," etc. A regex can't do this.

#### 5.4.2 AI Trip Planner
**What**: After selecting a route, the system suggests:
- Best time to travel (based on weather, traffic patterns)
- Popular stops along the route (tourist spots, food stops, rest areas)
- Estimated toll costs (scraped from NHAI data)
- "Did you know?" facts about the destination
**How**: Pre-generate trip plans for top 100 routes using Claude API. Cache in database. For long-tail routes, generate on-demand and cache.
**Why it's real AI**: Creates genuinely useful, route-specific travel content — not generic tourism copy. Considers season, weather, and local knowledge.

#### 5.4.3 Competitor Price Monitoring
**What**: Show "AaoCab vs competitors" pricing strip on car selection screen and route SEO pages.
**How**:
- Playwright headless browser scripts scrape Savaari, Ola Outstation, MakeMyTrip cabs daily for top 200 routes
- Store prices in `competitor_prices` table
- Display comparison: "AaoCab: ₹3,200 | Savaari: ₹3,500 | Ola: ₹3,800"
- Pricing engine ensures AaoCab is 5-10% below the cheapest competitor, with a floor at `vendor_cost + commission + 5% margin`
**Update frequency**: Daily for top 50 routes, weekly for the rest
**Why it's real AI**: It's actually automation, not AI — and we're honest about that. The value is in consistent, real-time competitive monitoring that no human can do across 500+ routes.

#### 5.4.4 Smart Fare Estimation
**What**: Live fare estimate appears as the user types the destination — before they hit "Search."
**How**: Google Distance Matrix API for distance/duration → apply vehicle-specific rate card → show estimated fare range in real-time.
**Debounce**: 500ms after user stops typing to avoid API spam.
**Why better**: No Indian cab booking platform shows price before the search button click. This is a genuine differentiation.

#### 5.4.5 AI Review Insights
**What**: On route and city pages, show AI-generated review summaries: "Travelers love: punctual drivers (mentioned 47 times), clean cars (38 times). Some noted: traffic delays on NH-2 (12 mentions)."
**How**: Aggregate reviews per route. Feed to Claude Haiku: "Summarize these 50 reviews for Delhi-Agra route. Extract top 3 positives and top 2 concerns with mention counts."
**Update frequency**: Weekly, cached.
**Why it's real AI**: Turns 50 reviews into one actionable paragraph. Customers read this instead of scrolling through 50 individual reviews.

#### 5.4.6 Pre-Trip Vehicle Quality Scoring
**What**: Before every trip, the driver uploads 7 photos (as per AaoCab's Pre-Trip Verification Protocol). AI scores cleanliness and flags damage.
**How**: Send photos to Claude Vision API: "Rate car cleanliness 1-10. List any visible damage or dirt. Is this car suitable for a customer pickup? Return JSON." Scores below 6 trigger ops team review.
**Cost**: ~₹0.80 per trip (7 images × ~$0.01/image)
**Why it's real AI**: Currently a human reviews every photo set. AI handles 80% automatically, flagging only the bad ones for human review. Saves 10-15 minutes per trip of ops team time.

### 5.5 SEO Engine

**Dynamic Page Generation**:
- Pages are generated from database records (cities, routes, airports, railway stations, vehicle types)
- Each combination produces a unique URL with unique content
- Content is generated once via Claude API, then stored in CMS and human-reviewed for top pages
- Schema.org structured data on every page (LocalBusiness, FAQPage, Product)

**Route Pages** (`/cabs/delhi-to-agra`):
```
┌─────────────────────────────┐
│  Booking Widget (pre-filled) │
│  From: Delhi  To: Agra      │
│  [Get Prices]               │
├─────────────────────────────┤
│  Delhi to Agra Cab Booking  │
│                             │
│  Fare Table:                │
│  Sedan    ₹2,800 - ₹3,200  │
│  Ertiga   ₹3,600 - ₹4,000  │
│  Innova   ₹4,200 - ₹4,800  │
│                             │
│  vs Competitors:            │
│  AaoCab ₹2,800 ✓ Cheapest  │
│  Savaari ₹3,100             │
│  Ola     ₹3,400             │
├─────────────────────────────┤
│  Trip Details:              │
│  Distance: 233 km           │
│  Duration: 3h 30m           │
│  Tolls: ~₹600               │
│  Best time: Oct-Mar          │
├─────────────────────────────┤
│  Popular Stops:             │
│  Mathura (2h) | Vrindavan   │
├─────────────────────────────┤
│  Reviews (this route):      │
│  ⭐ 4.7 from 89 trips       │
│  AI Summary: "Travelers..." │
├─────────────────────────────┤
│  FAQ (structured data):     │
│  Q: How much for Delhi to   │
│     Agra cab?               │
│  A: Starting at ₹2,800...  │
├─────────────────────────────┤
│  Related Routes:            │
│  Delhi→Jaipur | Delhi→Manali│
└─────────────────────────────┘
```

### 5.6 WhatsApp Booking Bot

**What**: A WhatsApp chatbot that handles the complete booking flow via conversation.
**How**: WhatsApp Business API (Gupshup) → webhook → Claude Haiku processes messages → booking API

**Sample Conversation**:
```
User: Hi, I need a cab from Kolkata to Digha on May 5
Bot: 🚗 Great! I found cabs for Kolkata → Digha on May 5.

Here are your options:
1️⃣ Sedan (4 seats) — ₹3,200 all-inclusive
2️⃣ Ertiga (6 seats) — ₹4,100 all-inclusive
3️⃣ Innova (7 seats) — ₹4,800 all-inclusive

Reply with 1, 2, or 3 to book.

User: 1
Bot: Sedan confirmed! ₹3,200 for Kolkata → Digha, May 5.
What time should the driver pick you up?

User: 7am
Bot: Got it — pickup at 7:00 AM.
To confirm, I'll need:
- Your full name
- Pickup address

User: Raju Das, 42 Park Street Kolkata
Bot: ✅ Almost there! Here's your booking:
🚗 Sedan | Kolkata → Digha
📅 May 5, 7:00 AM pickup
📍 42 Park Street, Kolkata
💰 ₹3,200 (pay ₹640 now, ₹2,560 to driver)

Pay ₹640 to confirm: [Razorpay Payment Link]

Or call us: 7890 302 302
```

**Handles**: Hindi/English/Hinglish. Falls back to human agent for complex requests.
**Cost**: ~₹4 per conversation (Gupshup) + ~₹0.40 Claude API per booking conversation

### 5.7 Trip Tracking (Public Link)

**URL**: `/track/[booking-id]` — shareable, no login required
**Shows**:
- Driver's real-time location on map (updated every 30 seconds)
- ETA to pickup/destination
- Driver contact info
- Trip status timeline (Confirmed → Driver Assigned → En Route → Arrived → Trip Started → Completed)
- Emergency button: tap to call AaoCab support

**Why public link**: Customer shares it with family. Spouse/parent tracks the trip from their own phone without downloading anything. This is a trust multiplier for family trips and women's safety.

---

## 6. Database Schema (Supabase)

### Core Tables (Customer App needs)

```sql
-- Users / Customers
customers (
  id uuid PK,
  phone text UNIQUE NOT NULL,
  name text,
  email text,
  language_preference text DEFAULT 'en', -- en, hi, bn
  created_at timestamptz,
  updated_at timestamptz
)

-- Bookings
bookings (
  id uuid PK,
  booking_number text UNIQUE, -- human-readable: AAO-20260424-001
  customer_id uuid FK → customers,
  trip_type text, -- outstation, local_rental, airport_transfer
  pickup_location jsonb, -- {address, lat, lng, city}
  drop_location jsonb,
  pickup_datetime timestamptz,
  return_datetime timestamptz, -- for round trips
  vehicle_category text, -- sedan, ertiga, innova, 12_seater, 16_seater
  distance_km numeric,
  duration_minutes integer,
  base_fare numeric,
  toll_estimate numeric,
  driver_allowance numeric,
  gst numeric,
  total_fare numeric,
  advance_amount numeric,
  balance_amount numeric,
  advance_payment_status text, -- pending, paid, refunded
  advance_payment_id text, -- Razorpay payment ID
  status text, -- pending, confirmed, driver_assigned, en_route, in_progress, completed, cancelled
  assigned_vendor_id uuid FK → vendors,
  assigned_driver_id uuid FK → drivers,
  assigned_vehicle_id uuid FK → vehicles,
  special_requests text,
  cancellation_reason text,
  cancelled_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)

-- Reviews
reviews (
  id uuid PK,
  booking_id uuid FK → bookings,
  customer_id uuid FK → customers,
  driver_id uuid FK → drivers,
  rating integer CHECK (1-5),
  review_text text,
  ai_sentiment text, -- positive, negative, neutral
  ai_categories jsonb, -- ["punctual", "clean_car", "polite"]
  route_key text, -- "delhi-to-agra" for route-level aggregation
  created_at timestamptz
)

-- Cities (for SEO pages)
cities (
  id uuid PK,
  name text,
  slug text UNIQUE, -- "kolkata"
  state text,
  lat numeric,
  lng numeric,
  is_active boolean DEFAULT true,
  seo_title text,
  seo_description text,
  seo_content text, -- AI-generated, human-reviewed
  popular_routes jsonb, -- ["delhi", "agra", "jaipur"]
  created_at timestamptz
)

-- Routes (for SEO pages + pricing)
routes (
  id uuid PK,
  from_city_id uuid FK → cities,
  to_city_id uuid FK → cities,
  slug text UNIQUE, -- "delhi-to-agra"
  distance_km numeric,
  duration_minutes integer,
  toll_estimate numeric,
  seo_title text,
  seo_description text,
  seo_content text,
  popular_stops jsonb, -- [{name, description, distance_from_start_km}]
  travel_tips text,
  best_season text,
  created_at timestamptz,
  updated_at timestamptz
)

-- Route Pricing (per vehicle category)
route_pricing (
  id uuid PK,
  route_id uuid FK → routes,
  vehicle_category text,
  base_price numeric, -- our price
  competitor_savaari numeric,
  competitor_ola numeric,
  competitor_makemytrip numeric,
  last_scraped_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)

-- Airports (for SEO pages)
airports (
  id uuid PK,
  name text,
  code text, -- "CCU"
  city_id uuid FK → cities,
  slug text, -- "kolkata-airport-taxi"
  lat numeric,
  lng numeric,
  seo_content text,
  created_at timestamptz
)

-- WhatsApp Conversations
whatsapp_conversations (
  id uuid PK,
  phone text,
  customer_id uuid FK → customers,
  messages jsonb, -- [{role, content, timestamp}]
  booking_id uuid FK → bookings, -- if a booking was created
  status text, -- active, completed, escalated_to_human
  created_at timestamptz,
  updated_at timestamptz
)
```

**Note**: Vendor, Driver, and Vehicle tables are defined in the Vendor App PRD. Both apps share the same database.

---

## 7. Brand & Design System

### 7.1 Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--primary` | `#4F4ED6` | All CTAs, buttons, links, nav hover, booking widget |
| `--primary-hover` | `#3D3CB8` | Button hover states |
| `--text-dark` | `#333333` | Body text, headings |
| `--teal-accent` | `#24B7A4` | Verified badges, success states, trust icons |
| `--bg-light` | `#F9F9F9` | Section backgrounds, card surfaces |
| `--bg-white` | `#FFFFFF` | Main background, cards |
| `--bg-dark` | `#060606` | Footer, dark sections |
| `--nav-dark` | `#384A59` | Mobile navigation background |
| `--error` | `#DF1529` | Error states, validation messages |
| `--success` | `#059652` | Success confirmations |

**Rule**: Blue dominant, Teal as accent only. Never use both at equal weight on one screen.

### 7.2 Typography

| Element | Font | Weight | Size (Mobile) | Size (Desktop) |
|---------|------|--------|---------------|----------------|
| H1 | Poppins | 700 | 28px | 40px |
| H2 | Poppins | 600 | 24px | 32px |
| H3 | Poppins | 600 | 20px | 24px |
| Body | Mulish | 400 | 16px | 16px |
| Body Strong | Mulish | 600 | 16px | 16px |
| Small | Mulish | 400 | 14px | 14px |
| Button | Poppins | 600 | 16px | 16px |
| Form Label | Mulish | 500 | 14px | 14px |
| Form Input | Mulish | 400 | 18px | 16px |

**Load via Google Fonts**: `Mulish:wght@400;500;600;700` and `Poppins:wght@500;600;700`

### 7.3 Component Design Tokens

| Component | Border Radius | Shadow | Height |
|-----------|--------------|--------|--------|
| Primary Button | 40px (full round) | none | 56px mobile, 48px desktop |
| Secondary Button | 40px | 1px border #4F4ED6 | 48px |
| Card | 12px | `0 2px 8px rgba(0,0,0,0.08)` | auto |
| Input Field | 8px | inset 1px border #E0E0E0 | 48px mobile |
| Booking Widget | 16px | `0 4px 24px rgba(0,0,0,0.12)` | auto |
| Bottom Nav | 0 (full width) | `0 -2px 8px rgba(0,0,0,0.1)` | 64px |

### 7.4 Tone of Voice

| Instead of | Write |
|-----------|-------|
| "Submit" | "Confirm My Trip" |
| "Error: Invalid input" | "Please check your travel date" |
| "Loading" | "Finding the best cars for you" |
| "No results" | "We don't have this route yet — call us at 7890 302 302 and we'll arrange it!" |
| "Payment failed" | "Payment didn't go through — try again or use a different method" |
| "Booking #AO2604001" | "Your trip is confirmed! Booking: AO-2604-001" |

---

## 8. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| First Contentful Paint | < 1.5s on 4G |
| Largest Contentful Paint | < 2.5s |
| Time to Interactive | < 3.5s |
| Cumulative Layout Shift | < 0.1 |
| Lighthouse Performance Score | > 90 |
| Mobile responsiveness | 100% of features work on 360px width |
| SEO page load (SSR) | < 1s TTFB |
| Booking API response | < 500ms |
| Uptime | 99.9% |
| Concurrent users | Handle 1,000 simultaneous |
| Accessibility | WCAG 2.1 AA |
| Browser support | Chrome 90+, Safari 14+, Firefox 90+, Samsung Internet |
| Device support | Android 9+, iOS 14+ |

---

## 9. Analytics & Success Metrics

### Key Metrics

| Metric | Definition | Target (Month 3) |
|--------|-----------|-------------------|
| Organic traffic | Monthly unique visitors from Google | 5,000 |
| Booking conversion rate | Visitors who complete a booking / total visitors | 3-5% |
| Booking completion time | Time from landing to payment confirmation | < 90 seconds |
| Mobile booking share | % of bookings from mobile devices | > 80% |
| WhatsApp booking share | % of bookings via WhatsApp bot | > 20% |
| Repeat booking rate | % of customers who book again within 90 days | > 30% |
| NPS (Net Promoter Score) | Post-trip survey | > 50 |
| SEO pages indexed | Pages in Google Search Console | > 200 |
| Average position (target keywords) | Google Search Console | < 20 |

### Tracking Events

- `page_view` — every page
- `booking_started` — user clicks "Get Prices"
- `car_selected` — user picks a vehicle
- `booking_completed` — payment successful
- `booking_abandoned` — user drops off (with step identification)
- `whatsapp_conversation_started`
- `whatsapp_booking_completed`
- `nlp_search_used` — user typed a natural language query
- `competitor_price_viewed` — user saw the price comparison strip
- `review_submitted`
- `trip_tracked` — someone opened the tracking link

---

## 10. Phased Rollout

### Phase 1: Foundation (Weeks 1-4)
- Homepage with booking widget
- 4-screen booking flow (outstation only)
- Razorpay payment integration (advance payment)
- Phone OTP authentication
- Booking confirmation + WhatsApp notification
- 20 route SEO pages (top routes from Kolkata)
- 5 city SEO pages
- Basic responsive design (mobile + desktop)
- Supabase schema + RLS policies
- Vercel deployment

### Phase 2: Intelligence (Weeks 5-8)
- NLP trip search (Claude Haiku)
- Competitor price scraping (top 50 routes)
- Price comparison strip on booking flow
- Smart fare estimation (live as user types)
- City rental + airport transfer booking flows
- 100+ route SEO pages
- Driver profile card on booking confirmation
- Trip tracking page (public link)
- WhatsApp booking confirmation automation
- My Bookings dashboard

### Phase 3: Scale (Weeks 9-12)
- WhatsApp booking bot (full conversational flow)
- AI trip planner (route suggestions, stops, tips)
- AI review insights on route pages
- Pre-trip vehicle quality scoring (Claude Vision)
- 500+ SEO pages (auto-generated from city/route database)
- Hindi language support
- Blog with travel content
- PostHog analytics + funnel optimization
- A/B testing framework

### Phase 4: Growth (Weeks 13-16)
- Bengali language support
- Voice booking (Sarvam AI integration)
- Referral program
- Corporate booking dashboard
- Loyalty/repeat customer discounts
- SEO content refresh automation
- Performance optimization pass
- Full accessibility audit

---

## 11. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Competitor scraping breaks (site changes) | Stale pricing data | Monitor scraper health daily. Fall back to manual pricing if scraping fails. Design for graceful degradation (hide comparison if data is >7 days old). |
| Google penalizes auto-generated SEO pages | Traffic drops | Human-review top 50 pages. Ensure content is genuinely unique per page. Add real reviews and dynamic pricing data (not just templated text). |
| WhatsApp bot misunderstands user | Bad booking or frustrated user | Always offer "Type HUMAN to talk to a person" escape hatch. Log all conversations for review. Start with top 10 routes only, expand as accuracy improves. |
| Driver/vehicle matching delays | Customer waits for assignment | Set SLA: driver assignment within 2 hours of booking. If no match in 1 hour, escalate to ops team. Show "Finding your driver" status to customer. |
| Razorpay advance payment disputes | Revenue loss | Clear cancellation policy shown before payment. Auto-refund for cancellations >24 hours. Manual review for <24 hour disputes. |

---

## 12. Dependencies

| Dependency | Owner | Status |
|-----------|-------|--------|
| Supabase database schema | Shared (Customer + Vendor apps) | Not started |
| Vendor/Driver data in database | Vendor App team | Blocked until Vendor App is built |
| Google Maps API key (production) | Sourabh | Available (in .env.local) |
| Razorpay merchant account | Sourabh | Needs activation for production |
| WhatsApp Business API approval | Sourabh | Needs application via Gupshup |
| Domain name (aaocab.com) | Sourabh | Existing |
| Claude API key | Sourabh | Needs Anthropic account |
| Brand assets (logo SVGs, photos) | Design team | Available in Dropbox |

---

*This PRD is a living document. It will be updated as we learn from user behavior, competitor changes, and technical discoveries during implementation.*
