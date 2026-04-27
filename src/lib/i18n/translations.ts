export type Language = "en" | "hi";

export const translations = {
  en: {
    // Navigation
    navHome: "Home",
    navBookings: "My Bookings",
    navHelp: "Help",
    navProfile: "Profile",

    // Booking flow
    getPrices: "Get Prices",
    select: "Select",
    bookNow: "Book Now",
    roundTrip: "Round Trip",
    oneWay: "One-way",

    // Common
    loading: "Loading...",
    error: "Error",
    tryAgain: "Try Again",
    callSupport: "Call Support: 7890 302 302",
    whatsappUs: "WhatsApp Us",
    back: "Back",
    continue: "Continue",
    somethingWentWrong: "Something went wrong",
    backToHome: "Back to Home",
    pageNotFound: "Page Not Found",
    pageNotFoundDesc:
      "The page you are looking for does not exist or may have been moved.",

    // Trust strip
    noHiddenCharges: "No hidden charges",
    freeCancellation: "Free cancellation 24hr",
    verifiedDrivers: "Verified drivers",

    // Footer links
    about: "About",
    safety: "Safety",
    terms: "Terms",
    privacy: "Privacy",
    refundPolicy: "Refund Policy",
    contact: "Contact",
    blog: "Blog",
    careers: "Careers",

    // Header / footer
    callUs: "Call us: 7890 302 302",
    tagline: "Traveling Made Simple With Aao Cab",
    copyright: "2026 AaoCab Technologies Pvt. Ltd.",
  },

  hi: {
    // Navigation
    navHome: "होम",
    navBookings: "मेरी बुकिंग",
    navHelp: "सहायता",
    navProfile: "प्रोफ़ाइल",

    // Booking flow
    getPrices: "किराया देखें",
    select: "चुनें",
    bookNow: "अभी बुक करें",
    roundTrip: "राउंड ट्रिप",
    oneWay: "एकतरफा",

    // Common
    loading: "लोड हो रहा है...",
    error: "त्रुटि",
    tryAgain: "पुनः प्रयास करें",
    callSupport: "सहायता कॉल करें: 7890 302 302",
    whatsappUs: "WhatsApp करें",
    back: "वापस",
    continue: "जारी रखें",
    somethingWentWrong: "कुछ गलत हो गया",
    backToHome: "होम पर वापस जाएं",
    pageNotFound: "पृष्ठ नहीं मिला",
    pageNotFoundDesc:
      "आप जिस पृष्ठ को ढूंढ रहे हैं वह मौजूद नहीं है या स्थानांतरित किया गया है।",

    // Trust strip
    noHiddenCharges: "कोई छुपा शुल्क नहीं",
    freeCancellation: "24 घंटे में मुफ्त रद्दीकरण",
    verifiedDrivers: "सत्यापित ड्राइवर",

    // Footer links
    about: "हमारे बारे में",
    safety: "सुरक्षा",
    terms: "नियम",
    privacy: "गोपनीयता",
    refundPolicy: "वापसी नीति",
    contact: "संपर्क",
    blog: "ब्लॉग",
    careers: "करियर",

    // Header / footer
    callUs: "हमें कॉल करें: 7890 302 302",
    tagline: "आओ कैब के साथ यात्रा करें — आसान और सुरक्षित",
    copyright: "2026 AaoCab Technologies Pvt. Ltd.",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;
