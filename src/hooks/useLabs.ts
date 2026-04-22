import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Lab = {
  id: string;
  name: string;
  name_hi: string | null;
  city: string;
  city_hi: string | null;
  address: string;
  phone: string;
  email: string;
  lat: number;
  lng: number;
  tests: string[];
  open_24_7: boolean;
  home_collection: boolean;
  accreditation: string;
  about: string;
  image: string;
  rating: number;
  featured: boolean;
};

export function useLabs() {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    supabase
      .from("pathology_labs")
      .select("*")
      .order("featured", { ascending: false })
      .order("rating", { ascending: false })
      .then(({ data, error }) => {
        if (cancel) return;
        if (error) setError(error.message);
        else setLabs((data ?? []) as Lab[]);
        setLoading(false);
      });
    return () => {
      cancel = true;
    };
  }, []);

  return { labs, loading, error };
}
