import { useEffect, useState } from "react";

export type LatLng = { lat: number; lng: number };

export function distanceKm(a: LatLng, b: LatLng): number {
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

const STORAGE_KEY = "carelink-geo";
const TTL_MS = 1000 * 60 * 30; // 30 min

type Stored = { lat: number; lng: number; at: number };

export function useUserLocation() {
  const [loc, setLoc] = useState<LatLng | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw) as Stored;
        if (Date.now() - s.at < TTL_MS) setLoc({ lat: s.lat, lng: s.lng });
      }
    } catch {
      /* ignore */
    }
  }, []);

  const request = () => {
    setError(null);
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("Geolocation not supported by your browser.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLoc(next);
        setLoading(false);
        try {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ ...next, at: Date.now() } as Stored),
          );
        } catch {
          /* ignore */
        }
      },
      (err) => {
        setError(err.message || "Unable to get location.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60_000 },
    );
  };

  const clear = () => {
    setLoc(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

  return { loc, loading, error, request, clear };
}
