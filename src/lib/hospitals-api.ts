import { supabase } from "@/integrations/supabase/client";
import type { Hospital, Specialty } from "@/data/hospitals";

type Row = {
  id: string;
  name: string;
  name_hi: string | null;
  city: string;
  city_hi: string | null;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  specialties: string[];
  open_24_7: boolean;
  emergency: boolean;
  icu: boolean;
  ambulance: boolean;
  rating: number;
  reviews_count: number;
  about: string;
  image: string;
  featured: boolean;
};

export function rowToHospital(r: Row): Hospital {
  return {
    id: r.id,
    name: r.name,
    nameHi: r.name_hi ?? undefined,
    city: r.city,
    cityHi: r.city_hi ?? undefined,
    address: r.address,
    phone: r.phone,
    lat: Number(r.lat),
    lng: Number(r.lng),
    specialties: r.specialties as Specialty[],
    open24_7: r.open_24_7,
    emergency: r.emergency,
    icu: r.icu,
    ambulance: r.ambulance,
    rating: Number(r.rating),
    reviews: r.reviews_count,
    about: r.about,
    image: r.image,
    featured: r.featured,
  };
}

export async function fetchAllHospitals(): Promise<Hospital[]> {
  const { data, error } = await supabase
    .from("hospitals")
    .select("*")
    .order("featured", { ascending: false })
    .order("rating", { ascending: false });
  if (error) throw error;
  return (data as Row[]).map(rowToHospital);
}

export async function fetchHospitalById(id: string): Promise<Hospital | null> {
  const { data, error } = await supabase.from("hospitals").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? rowToHospital(data as Row) : null;
}
