import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Search, Siren, MapPin, Stethoscope, ShieldCheck, Clock, Building2, Heart, Brain, Baby, Bone, Eye } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import { CITIES, SPECIALTIES } from "@/data/hospitals";
import { HospitalCard } from "@/components/HospitalCard";
import { useHospitals } from "@/hooks/useHospitals";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MediFinder — Find hospitals & emergency care in Uttar Pradesh" },
      { name: "description", content: "Smart hospital search across Uttar Pradesh. Filter by city, specialty, ICU, ambulance & 24/7 emergency." },
    ],
  }),
  component: Index,
});

const SPEC_ICONS: Record<string, typeof Heart> = {
  Cardiology: Heart,
  Neurology: Brain,
  Pediatrics: Baby,
  Orthopedics: Bone,
  Ophthalmology: Eye,
  General: Stethoscope,
};

function Index() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const { hospitals: HOSPITALS } = useHospitals();

  const featured = HOSPITALS.filter((h) => h.featured).slice(0, 6);
  const topCities = CITIES.slice(0, 8);
  const topSpecs = SPECIALTIES.slice(0, 8);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    navigate({ to: "/search", search: { q: q.trim(), city: "", specialty: "", emergency: false, icu: false, ambulance: false, open24_7: false, minRating: 0 } });
  };

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-soft">
        <div className="absolute inset-0 -z-10 opacity-60 [background-image:radial-gradient(circle_at_20%_20%,oklch(0.55_0.18_165/0.15),transparent_50%),radial-gradient(circle_at_80%_30%,oklch(0.62_0.15_195/0.18),transparent_55%)]" />
        <div className="container mx-auto px-4 pt-12 pb-16 md:pt-20 md:pb-24">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              Uttar Pradesh · 30+ verified hospitals
            </span>
            <h1 className="mt-4 text-4xl md:text-6xl font-bold tracking-tight text-foreground">
              {t("tagline")}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
              Search by city, specialty or hospital. Filter by ICU, ambulance and 24/7 emergency — get the right care in seconds.
            </p>

            <form onSubmit={onSearch} className="mt-8 flex flex-col sm:flex-row gap-2 max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={t("hero_search_placeholder")}
                  className="h-12 pl-11 text-base shadow-soft"
                />
              </div>
              <Button type="submit" variant="hero" size="lg" className="h-12 px-6">
                <Search className="h-4 w-4" />
                {t("hero_cta_search")}
              </Button>
              <Button asChild type="button" variant="emergency" size="lg" className="h-12 px-6 animate-pulse-emergency">
                <Link to="/emergency"><Siren className="h-4 w-4" />{t("hero_cta_emergency")}</Link>
              </Button>
            </form>

            <dl className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl">
              {[
                { v: `${HOSPITALS.length}+`, k: t("stat_hospitals") },
                { v: `${CITIES.length}`, k: t("stat_cities") },
                { v: `${SPECIALTIES.length}`, k: t("stat_specialties") },
                { v: `${HOSPITALS.filter((h) => h.open24_7).length}`, k: t("stat_247") },
              ].map((s) => (
                <div key={s.k} className="rounded-xl border border-border bg-card/70 p-4 backdrop-blur shadow-soft">
                  <dt className="text-2xl font-bold text-foreground">{s.v}</dt>
                  <dd className="text-xs text-muted-foreground mt-1">{s.k}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Cities */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{t("section_cities")}</h2>
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {topCities.map((city) => (
            <Link
              key={city}
              to="/search"
              search={{ q: "", city, specialty: "", emergency: false, icu: false, ambulance: false, open24_7: false, minRating: 0 }}
              className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-soft hover:shadow-elegant hover:border-primary/40 transition-all"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <MapPin className="h-5 w-5" />
              </span>
              <div>
                <div className="font-semibold text-sm">{city}</div>
                <div className="text-xs text-muted-foreground">{HOSPITALS.filter((h) => h.city === city).length} hospitals</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Specialties */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{t("section_specialties")}</h2>
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {topSpecs.map((spec) => {
            const Icon = SPEC_ICONS[spec] ?? Stethoscope;
            return (
              <Link
                key={spec}
                to="/search"
                search={{ q: "", city: "", specialty: spec, emergency: false, icu: false, ambulance: false, open24_7: false, minRating: 0 }}
                className="group flex flex-col items-start gap-3 rounded-xl border border-border bg-card p-5 shadow-soft hover:shadow-elegant hover:border-primary/40 transition-all"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-hero text-primary-foreground shadow-soft">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="font-semibold">{spec}</div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{t("section_featured")}</h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/search" search={{ q: "", city: "", specialty: "", emergency: false, icu: false, ambulance: false, open24_7: false, minRating: 0 }}>
              View all <Building2 className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featured.map((h) => (
            <HospitalCard key={h.id} hospital={h} />
          ))}
        </div>
      </section>

      {/* Emergency CTA */}
      <section className="container mx-auto px-4 pb-12">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-emergency p-8 md:p-12 text-emergency-foreground shadow-emergency">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="relative max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
              <Clock className="h-3.5 w-3.5" /> 24/7
            </span>
            <h3 className="mt-3 text-3xl md:text-4xl font-bold">{t("emergency_title")}</h3>
            <p className="mt-2 opacity-90">{t("emergency_desc")}</p>
            <Button asChild size="lg" variant="secondary" className="mt-6">
              <Link to="/emergency"><Siren className="h-4 w-4" />{t("hero_cta_emergency")}</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
