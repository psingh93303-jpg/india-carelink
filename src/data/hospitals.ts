export type Specialty =
  | "General"
  | "Cardiology"
  | "Orthopedics"
  | "Gynecology"
  | "Pediatrics"
  | "Neurology"
  | "Oncology"
  | "Nephrology"
  | "Dermatology"
  | "ENT"
  | "Ophthalmology"
  | "Trauma";

export type Hospital = {
  id: string;
  name: string;
  nameHi?: string;
  city: string;
  cityHi?: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  specialties: Specialty[];
  open24_7: boolean;
  emergency: boolean;
  icu: boolean;
  ambulance: boolean;
  rating: number;
  reviews: number;
  about: string;
  image: string;
  featured?: boolean;
};

export const CITIES = [
  "Lucknow",
  "Kanpur",
  "Varanasi",
  "Agra",
  "Prayagraj",
  "Meerut",
  "Noida",
  "Ghaziabad",
  "Bareilly",
  "Gorakhpur",
  "Aligarh",
  "Moradabad",
] as const;

export const SPECIALTIES: Specialty[] = [
  "General",
  "Cardiology",
  "Orthopedics",
  "Gynecology",
  "Pediatrics",
  "Neurology",
  "Oncology",
  "Nephrology",
  "Dermatology",
  "ENT",
  "Ophthalmology",
  "Trauma",
];

const img = (seed: string) =>
  `https://images.unsplash.com/photo-${seed}?auto=format&fit=crop&w=1200&q=70`;

export const HOSPITALS: Hospital[] = [
  // Lucknow
  { id: "sgpgi-lko", name: "SGPGIMS", nameHi: "एसजीपीजीआई", city: "Lucknow", address: "Raebareli Road, Lucknow", phone: "+915222494000", lat: 26.7437, lng: 80.9462, specialties: ["Cardiology","Neurology","Nephrology","Oncology","Trauma"], open24_7: true, emergency: true, icu: true, ambulance: true, rating: 4.7, reviews: 2310, about: "Premier tertiary-care institute offering super-specialty services and 24/7 emergency.", image: img("1538108149393-fbbd81895907"), featured: true },
  { id: "kgmu-lko", name: "King George's Medical University", city: "Lucknow", address: "Shah Mina Road, Chowk, Lucknow", phone: "+915222257540", lat: 26.8721, lng: 80.9120, specialties: ["General","Trauma","Cardiology","Orthopedics","Pediatrics"], open24_7: true, emergency: true, icu: true, ambulance: true, rating: 4.5, reviews: 1980, about: "Government medical university with full emergency, trauma and ICU facilities.", image: img("1586773860418-d37222d8fce3"), featured: true },
  { id: "medanta-lko", name: "Medanta Hospital Lucknow", city: "Lucknow", address: "Sector A, Pocket 1, Sushant Golf City", phone: "+915223505050", lat: 26.7732, lng: 80.9889, specialties: ["Cardiology","Oncology","Neurology","Orthopedics"], open24_7: true, emergency: true, icu: true, ambulance: true, rating: 4.6, reviews: 1420, about: "Multi-specialty private hospital with advanced cardiac and cancer care.", image: img("1519494026892-80bbd2d6fd0d"), featured: true },
  { id: "apollo-lko", name: "Apollomedics Super Speciality", city: "Lucknow", address: "Sector B, Kanpur Road", phone: "+915226764444", lat: 26.7905, lng: 80.8889, specialties: ["Cardiology","Neurology","Oncology","Gynecology"], open24_7: true, emergency: true, icu: true, ambulance: true, rating: 4.5, reviews: 980, about: "Apollo group multi-specialty with 24/7 emergency.", image: img("1551601651-2a8555f1a136") },
  { id: "ram-lko", name: "Ram Manohar Lohia Institute", city: "Lucknow", address: "Vibhuti Khand, Gomti Nagar", phone: "+915222494000", lat: 26.8587, lng: 81.0086, specialties: ["General","Trauma","Cardiology"], open24_7: true, emergency: true, icu: true, ambulance: true, rating: 4.3, reviews: 760, about: "Government super-specialty institute.", image: img("1504439468489-c8920d796a29") },

  // Kanpur
  { id: "ganesh-knp", name: "Ganesh Shankar Vidyarthi Memorial", city: "Kanpur", address: "Swaroop Nagar, Kanpur", phone: "+915122533052", lat: 26.4906, lng: 80.3192, specialties: ["General","Trauma","Pediatrics","Gynecology"], open24_7: true, emergency: true, icu: true, ambulance: true, rating: 4.2, reviews: 890, about: "Govt. medical college hospital — Kanpur's largest emergency facility.", image: img("1631815588090-d4bfec5b1ccb"), featured: true },
  { id: "regency-knp", name: "Regency Hospital", city: "Kanpur", address: "A-2, Sarvodaya Nagar", phone: "+915123918000", lat: 26.4801, lng: 80.3284, specialties: ["Cardiology","Orthopedics","Nephrology"], open24_7: true, emergency: true, icu: true, ambulance: true, rating: 4.6, reviews: 1240, about: "Leading multi-specialty private hospital in Kanpur.", image: img("1586773860418-d37222d8fce3") },
  { id: "rama-knp", name: "Rama Hospital", city: "Kanpur", address: "Mandhana, Kanpur", phone: "+915122970011", lat: 26.5602, lng: 80.2412, specialties: ["General","Pediatrics","Gynecology","Orthopedics"], open24_7: false, emergency: true, icu: true, ambulance: true, rating: 4.1, reviews: 410, about: "Multi-specialty teaching hospital.", image: img("1538108149393-fbbd81895907") },
  { id: "kanpur-eye", name: "Kanpur Eye Hospital", city: "Kanpur", address: "Civil Lines, Kanpur", phone: "+915122304040", lat: 26.4670, lng: 80.3420, specialties: ["Ophthalmology"], open24_7: false, emergency: false, icu: false, ambulance: false, rating: 4.4, reviews: 320, about: "Specialty eye-care center.", image: img("1551601651-2a8555f1a136") },

  // Varanasi
  { id: "bhu-vns", name: "Sir Sunderlal Hospital, BHU", city: "Varanasi", address: "BHU Campus, Varanasi", phone: "+915422369401", lat: 25.2677, lng: 82.9913, specialties: ["General","Cardiology","Oncology","Neurology","Trauma"], open24_7: true, emergency: true, icu: true, ambulance: true, rating: 4.4, reviews: 1620, about: "Tertiary care hospital attached to BHU medical institute.", image: img("1504439468489-c8920d796a29"), featured: true },
  { id: "heritage-vns", name: "Heritage Hospital", city: "Varanasi", address: "Lanka, Varanasi", phone: "+915422317600", lat: 25.2820, lng: 82.9999, specialties: ["Cardiology","Orthopedics","Gynecology"], open24_7: true, emergency: true, icu: true, ambulance: true, rating: 4.3, reviews: 540, about: "Multi-specialty private hospital.", image: img("1586773860418-d37222d8fce3") },
  { id: "popular-vns", name: "Popular Hospital", city: "Varanasi", address: "Sigra, Varanasi", phone: "+915422223344", lat: 25.3176, lng: 82.9739, specialties: ["General","Pediatrics","Gynecology"], open24_7: false, emergency: true, icu: true, ambulance: true, rating: 4.0, reviews: 280, about: "Community hospital with maternity care.", image: img("1538108149393-fbbd81895907") },

  // Agra
  { id: "sn-agra", name: "S. N. Medical College Hospital", city: "Agra", address: "Hospital Road, Agra", phone: "+915622521356", lat: 27.1898, lng: 78.0235, specialties: ["General","Trauma","Cardiology","Pediatrics"], open24_7: true, emergency: true, icu: true, ambulance: true, rating: 4.2, reviews: 920, about: "Govt. medical college hospital with 24/7 emergency.", image: img("1631815588090-d4bfec5b1ccb"), featured: true },
  { id: "pushpanjali-agra", name: "Pushpanjali Hospital", city: "Agra", address: "Pushpanjali Palace, Delhi Gate", phone: "+915623057777", lat: 27.2046, lng: 78.0072, specialties: ["Cardiology","Neurology","Orthopedics"], open24_7: true, emergency: true, icu: true, ambulance: true, rating: 4.5, reviews: 670, about: "Multi-specialty NABH-accredited hospital.", image: img("1519494026892-80bbd2d6fd0d") },
  { id: "synergy-agra", name: "Synergy Plus Hospital", city: "Agra", address: "Sector 12, Awas Vikas", phone: "+915624010000", lat: 27.2120, lng: 77.9810, specialties: ["Orthopedics","Gynecology","ENT"], open24_7: false, emergency: true, icu: true, ambulance: true, rating: 4.3, reviews: 410, about: "Modern private super-specialty hospital.", image: img("1504439468489-c8920d796a29") },

  // Prayagraj
  { id: "swaroop-prg", name: "Swaroop Rani Nehru Hospital", city: "Prayagraj", address: "MLN Medical College, Prayagraj", phone: "+915322256251", lat: 25.4358, lng: 81.8463, specialties: ["General","Trauma","Pediatrics","Gynecology"], open24_7: true, emergency: true, icu: true, ambulance: true, rating: 4.1, reviews: 760, about: "Govt. teaching hospital with full emergency services.", image: img("1631815588090-d4bfec5b1ccb") },
  { id: "phoenix-prg", name: "Phoenix Hospital", city: "Prayagraj", address: "Civil Lines, Prayagraj", phone: "+915322260101", lat: 25.4561, lng: 81.8278, specialties: ["Cardiology","Orthopedics"], open24_7: true, emergency: true, icu: true, ambulance: true, rating: 4.4, reviews: 380, about: "Private multi-specialty hospital.", image: img("1586773860418-d37222d8fce3") },
  { id: "vatsalya-prg", name: "Vatsalya Hospital", city: "Prayagraj", address: "Tagore Town, Prayagraj", phone: "+915322465544", lat: 25.4682, lng: 81.8552, specialties: ["Pediatrics","Gynecology"], open24_7: false, emergency: false, icu: true, ambulance: false, rating: 4.5, reviews: 290, about: "Mother & child specialty hospital.", image: img("1551601651-2a8555f1a136") },

  // Meerut
  { id: "anand-mrt", name: "Anand Hospital", city: "Meerut", address: "Mawana Road, Meerut", phone: "+911212620202", lat: 28.9845, lng: 77.7064, specialties: ["General","Cardiology","Orthopedics"], open24_7: true, emergency: true, icu: true, ambulance: true, rating: 4.3, reviews: 540, about: "Multi-specialty hospital with 24/7 emergency.", image: img("1538108149393-fbbd81895907") },
  { id: "subharti-mrt", name: "Subharti Medical College Hospital", city: "Meerut", address: "Subharti Puram, NH-58", phone: "+911212439043", lat: 28.9931, lng: 77.6403, specialties: ["General","Trauma","Pediatrics","Neurology"], open24_7: true, emergency: true, icu: true, ambulance: true, rating: 4.2, reviews: 690, about: "Teaching hospital with super-specialty departments.", image: img("1504439468489-c8920d796a29") },

  // Noida
  { id: "fortis-noida", name: "Fortis Hospital Noida", city: "Noida", address: "B-22, Sector 62", phone: "+911204300222", lat: 28.6275, lng: 77.3719, specialties: ["Cardiology","Oncology","Neurology","Orthopedics"], open24_7: true, emergency: true, icu: true, ambulance: true, rating: 4.6, reviews: 1810, about: "Internationally accredited multi-specialty hospital.", image: img("1519494026892-80bbd2d6fd0d"), featured: true },
  { id: "jaypee-noida", name: "Jaypee Hospital", city: "Noida", address: "Sector 128, Noida", phone: "+911204122222", lat: 28.5072, lng: 77.3892, specialties: ["Cardiology","Oncology","Nephrology","Trauma"], open24_7: true, emergency: true, icu: true, ambulance: true, rating: 4.5, reviews: 1320, about: "Tertiary-care hospital with advanced organ transplant.", image: img("1586773860418-d37222d8fce3") },
  { id: "kailash-noida", name: "Kailash Hospital", city: "Noida", address: "H-33, Sector 27", phone: "+911202444444", lat: 28.5740, lng: 77.3242, specialties: ["General","Gynecology","Orthopedics","ENT"], open24_7: true, emergency: true, icu: true, ambulance: true, rating: 4.2, reviews: 870, about: "Multi-specialty hospital chain.", image: img("1551601651-2a8555f1a136") },

  // Ghaziabad
  { id: "yashoda-gzb", name: "Yashoda Super Speciality", city: "Ghaziabad", address: "III-M, Nehru Nagar", phone: "+911204182000", lat: 28.6692, lng: 77.4538, specialties: ["Cardiology","Neurology","Orthopedics"], open24_7: true, emergency: true, icu: true, ambulance: true, rating: 4.4, reviews: 980, about: "NABH-accredited super-specialty hospital.", image: img("1504439468489-c8920d796a29") },
  { id: "max-gzb", name: "Max Super Speciality Vaishali", city: "Ghaziabad", address: "W-3, Sector 1, Vaishali", phone: "+911204033333", lat: 28.6457, lng: 77.3392, specialties: ["Cardiology","Oncology","Nephrology"], open24_7: true, emergency: true, icu: true, ambulance: true, rating: 4.5, reviews: 1450, about: "Max Healthcare super-specialty hospital.", image: img("1538108149393-fbbd81895907") },

  // Bareilly
  { id: "srms-brl", name: "SRMS Institute of Medical Sciences", city: "Bareilly", address: "Bhojipura, Bareilly", phone: "+915812582100", lat: 28.4031, lng: 79.4309, specialties: ["General","Cardiology","Trauma","Oncology"], open24_7: true, emergency: true, icu: true, ambulance: true, rating: 4.3, reviews: 720, about: "Multi-specialty teaching hospital.", image: img("1631815588090-d4bfec5b1ccb") },
  { id: "rohilkhand-brl", name: "Rohilkhand Hospital", city: "Bareilly", address: "Pilibhit Bypass Road", phone: "+915812529669", lat: 28.3889, lng: 79.4321, specialties: ["General","Pediatrics","Gynecology"], open24_7: true, emergency: true, icu: true, ambulance: true, rating: 4.1, reviews: 410, about: "Multi-specialty hospital with 24/7 emergency.", image: img("1586773860418-d37222d8fce3") },

  // Gorakhpur
  { id: "brd-gkp", name: "BRD Medical College Hospital", city: "Gorakhpur", address: "Medical College Road", phone: "+915512504106", lat: 26.7475, lng: 83.3911, specialties: ["General","Trauma","Pediatrics"], open24_7: true, emergency: true, icu: true, ambulance: true, rating: 4.0, reviews: 880, about: "Govt. teaching hospital — eastern UP's major referral center.", image: img("1504439468489-c8920d796a29") },
  { id: "fatima-gkp", name: "Fatima Hospital", city: "Gorakhpur", address: "Asuran Chowk", phone: "+915512270001", lat: 26.7672, lng: 83.3712, specialties: ["General","Gynecology","Pediatrics"], open24_7: false, emergency: true, icu: true, ambulance: true, rating: 4.4, reviews: 360, about: "Christian-mission hospital with maternity care.", image: img("1551601651-2a8555f1a136") },

  // Aligarh
  { id: "jnmc-alg", name: "Jawaharlal Nehru Medical College", city: "Aligarh", address: "AMU Campus, Aligarh", phone: "+915712721162", lat: 27.9099, lng: 78.0780, specialties: ["General","Cardiology","Trauma","Neurology"], open24_7: true, emergency: true, icu: true, ambulance: true, rating: 4.3, reviews: 980, about: "AMU's tertiary-care teaching hospital.", image: img("1538108149393-fbbd81895907") },
  { id: "varun-alg", name: "Varun Hospital", city: "Aligarh", address: "Marris Road, Aligarh", phone: "+915712401010", lat: 27.8923, lng: 78.0843, specialties: ["Orthopedics","Gynecology","ENT"], open24_7: false, emergency: true, icu: true, ambulance: false, rating: 4.2, reviews: 240, about: "Multi-specialty private hospital.", image: img("1586773860418-d37222d8fce3") },

  // Moradabad
  { id: "teerthankar-mbd", name: "Teerthanker Mahaveer Hospital", city: "Moradabad", address: "Delhi Road, Moradabad", phone: "+915912360500", lat: 28.7785, lng: 78.7390, specialties: ["General","Cardiology","Trauma","Orthopedics"], open24_7: true, emergency: true, icu: true, ambulance: true, rating: 4.4, reviews: 620, about: "Multi-specialty teaching hospital.", image: img("1504439468489-c8920d796a29") },
  { id: "kashi-mbd", name: "Kashi Ram Hospital", city: "Moradabad", address: "Ram Ganga Vihar", phone: "+915912452100", lat: 28.8390, lng: 78.7732, specialties: ["General","Pediatrics","Gynecology"], open24_7: false, emergency: true, icu: true, ambulance: true, rating: 4.0, reviews: 180, about: "Community hospital with emergency facility.", image: img("1551601651-2a8555f1a136") },
];

export function getHospitalById(id: string): Hospital | undefined {
  return HOSPITALS.find((h) => h.id === id);
}

// Haversine distance in km
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(x));
}
