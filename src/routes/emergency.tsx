import { createFileRoute, Link } from "@tanstack/react-router";
import { Siren, MapPin, Phone, Loader2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { HOSPITALS, distanceKm } from "@/data/hospitals";
import { HospitalCard } from "@/components/HospitalCard";
import { MapView } from "@/components/MapView";

export const Route = createFileRoute("/emergency")({
  head: () => ({
    meta: [
      { title: "Emergency Mode — Nearest hospitals · MediFinder" },
      { name: "description", content: "Find the nearest hospital with emergency, ICU and ambulance services in Uttar Pradesh." },
      { property: "og:title", content: "Emergency Mode — MediFinder" },
      { property: "og:description", content: "One-tap nearest emergency hospital finder for Uttar Pradesh." },
    ],
  }),
  component: EmergencyPage,
});

function EmergencyPage() {
  const { t } = useI18n();
  const [loc, setLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = () => {
    setError(null);
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      (err) => {
        setError(err.message || "Unable to get location.");
        setLoading(false);
        // Fallback to Lucknow center
        setLoc({ lat: 26.8467, lng: 80.9462 });
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const emergencyHospitals = HOSPITALS.filter((h) => h.emergency);
  const nearest = loc
    ? emergencyHospitals
        .map((h) => ({ h, d: distanceKm(loc, h) }))
        .sort((a, b) => a.d - b.d)
        .slice(0, 8)
    : [];

  return (
    <div>
      {/* Emergency hero */}
      <section className="bg-gradient-emergency text-emergency-foreground">
        <div className="container mx-auto px-4 py-10 md:py-16">
          <div className="flex items-start gap-4 max-w-3xl">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
              <Siren className="h-7 w-7" />
            </span>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">{t("emergency_title")}</h1>
              <p className="mt-2 opacity-90">{t("emergency_desc")}</p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Button onClick={requestLocation} disabled={loading} size="lg" variant="secondary" className="font-semibold">
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" />{t("locating")}</> : <><MapPin className="h-4 w-4" />{t("use_my_location")}</>}
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white">
                  <a href="tel:108"><Phone className="h-4 w-4" /> Call 108 Ambulance</a>
                </Button>
              </div>
              {error && (
                <p className="mt-3 flex items-center gap-2 text-sm bg-white/10 rounded-lg px-3 py-2 backdrop-blur">
                  <AlertCircle className="h-4 w-4" />
                  {error} (showing Lucknow as default)
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="container mx-auto px-4 py-10">
        {loc ? (
          <>
            <div className="grid lg:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-bold">{t("nearest_hospitals")}</h2>
                <div className="mt-4 space-y-4">
                  {nearest.map(({ h, d }) => (
                    <HospitalCard key={h.id} hospital={h} distanceKm={d} />
                  ))}
                </div>
              </div>
              <div className="lg:sticky lg:top-24 self-start">
                <MapView
                  points={nearest.map(({ h }) => ({ id: h.id, name: h.name, lat: h.lat, lng: h.lng, emergency: true }))}
                  userLocation={loc}
                  height={520}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <Siren className="mx-auto h-10 w-10 text-emergency" />
            <p className="mt-3 text-muted-foreground max-w-md mx-auto">
              Tap "{t("use_my_location")}" to find the nearest emergency hospital.
            </p>
            <Button asChild variant="outline" className="mt-5">
              <Link to="/search" search={{ q: "", city: "", specialty: "", emergency: true, icu: false, ambulance: true, open24_7: false, minRating: 0 }}>
                Browse all emergency hospitals
              </Link>
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
