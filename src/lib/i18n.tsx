import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "hi";

const dict = {
  en: {
    brand: "MediFinder",
    tagline: "Find hospitals & emergency care across Uttar Pradesh — instantly.",
    nav_home: "Home",
    nav_search: "Find Hospitals",
    nav_emergency: "Emergency",
    nav_about: "About",
    hero_search_placeholder: "Search by hospital, city or specialty…",
    hero_cta_search: "Search Hospitals",
    hero_cta_emergency: "Emergency Mode",
    stat_hospitals: "Hospitals listed",
    stat_cities: "Cities covered",
    stat_specialties: "Specialties",
    stat_247: "Open 24/7",
    section_cities: "Popular cities",
    section_specialties: "Browse by specialty",
    section_featured: "Featured hospitals",
    filters: "Filters",
    filter_city: "City",
    filter_specialty: "Specialty",
    filter_24_7: "Open 24/7",
    filter_emergency: "Emergency",
    filter_icu: "ICU",
    filter_ambulance: "Ambulance",
    filter_min_rating: "Min rating",
    all_cities: "All cities",
    all_specialties: "All specialties",
    results: "results",
    no_results: "No hospitals match your filters.",
    clear_filters: "Clear filters",
    call_now: "Call now",
    get_directions: "Get directions",
    view_details: "View details",
    services: "Services offered",
    about: "About",
    location: "Location",
    rating: "Rating",
    reviews: "reviews",
    emergency_title: "Emergency Mode",
    emergency_desc: "Allow location to find the nearest hospitals with emergency & ambulance services.",
    use_my_location: "Use my location",
    locating: "Locating…",
    nearest_hospitals: "Nearest emergency hospitals",
    km_away: "km away",
    has_ambulance: "Ambulance",
    has_icu: "ICU",
    open_24_7: "24/7",
    back: "Back",
    footer_note: "Demo data for Uttar Pradesh. Always call 108 for medical emergencies.",
    not_found_title: "Hospital not found",
    go_home: "Go home",
  },
  hi: {
    brand: "मेडीफाइंडर",
    tagline: "उत्तर प्रदेश में अस्पताल और आपातकालीन सेवाएँ — तुरंत खोजें।",
    nav_home: "होम",
    nav_search: "अस्पताल खोजें",
    nav_emergency: "आपातकाल",
    nav_about: "हमारे बारे में",
    hero_search_placeholder: "अस्पताल, शहर या विशेषता खोजें…",
    hero_cta_search: "अस्पताल खोजें",
    hero_cta_emergency: "आपातकालीन मोड",
    stat_hospitals: "सूचीबद्ध अस्पताल",
    stat_cities: "शहर शामिल",
    stat_specialties: "विशेषताएँ",
    stat_247: "24/7 खुले",
    section_cities: "लोकप्रिय शहर",
    section_specialties: "विशेषता के अनुसार",
    section_featured: "विशेष अस्पताल",
    filters: "फ़िल्टर",
    filter_city: "शहर",
    filter_specialty: "विशेषता",
    filter_24_7: "24/7 खुला",
    filter_emergency: "आपातकाल",
    filter_icu: "आईसीयू",
    filter_ambulance: "एम्बुलेंस",
    filter_min_rating: "न्यूनतम रेटिंग",
    all_cities: "सभी शहर",
    all_specialties: "सभी विशेषताएँ",
    results: "परिणाम",
    no_results: "कोई अस्पताल नहीं मिला।",
    clear_filters: "फ़िल्टर हटाएँ",
    call_now: "कॉल करें",
    get_directions: "दिशा-निर्देश",
    view_details: "विवरण देखें",
    services: "उपलब्ध सेवाएँ",
    about: "परिचय",
    location: "स्थान",
    rating: "रेटिंग",
    reviews: "समीक्षाएँ",
    emergency_title: "आपातकालीन मोड",
    emergency_desc: "नज़दीकी आपातकालीन अस्पताल खोजने के लिए स्थान की अनुमति दें।",
    use_my_location: "मेरा स्थान उपयोग करें",
    locating: "खोज रहे हैं…",
    nearest_hospitals: "नज़दीकी आपातकालीन अस्पताल",
    km_away: "किमी दूर",
    has_ambulance: "एम्बुलेंस",
    has_icu: "आईसीयू",
    open_24_7: "24/7",
    back: "वापस",
    footer_note: "उत्तर प्रदेश के लिए डेमो डेटा। आपातकाल में 108 पर कॉल करें।",
    not_found_title: "अस्पताल नहीं मिला",
    go_home: "होम पर जाएँ",
  },
} as const;

export type TKey = keyof typeof dict.en;

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: TKey) => string };
const I18nCtx = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = (typeof window !== "undefined" && localStorage.getItem("medifinder-lang")) as Lang | null;
    if (stored === "en" || stored === "hi") setLangState(stored);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("medifinder-lang", l);
  };

  const t = (k: TKey) => dict[lang][k] ?? dict.en[k] ?? k;

  return <I18nCtx.Provider value={{ lang, setLang, t }}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nCtx);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
