import { useEffect, useState } from "react";
import type { Hospital } from "@/data/hospitals";
import { fetchAllHospitals } from "@/lib/hospitals-api";

export function useHospitals() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchAllHospitals()
      .then((data) => {
        if (!cancelled) setHospitals(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load hospitals");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { hospitals, loading, error };
}
