import { createFileRoute, Link } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { Search, SlidersHorizontal, X, Crosshair, Loader2, ShieldCheck } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useI18n } from "@/lib/i18n";
import { CITIES, SPECIALTIES, type Specialty } from "@/data/hospitals";
import { HospitalCard } from "@/components/HospitalCard";
import { useHospitals } from "@/hooks/useHospitals";
import { useUserLocation, distanceKm } from "@/lib/geo";

const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
  city: fallback(z.string(), "").default(""),
  specialty: fallback(z.string(), "").default(""),
  emergency: fallback(z.boolean(), false).default(false),
  icu: fallback(z.boolean(), false).default(false),
  ambulance: fallback(z.boolean(), false).default(false),
  open24_7: fallback(z.boolean(), false).default(false),
  verified: fallback(z.boolean(), false).default(false),
  minRating: fallback(z.number(), 0).default(0),
});

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Find Hospitals — MediFinder" },
      { name: "description", content: "Search hospitals across Uttar Pradesh by city, specialty, rating & emergency facilities." },
    ],
  }),
  validateSearch: zodValidator(searchSchema),
  component: SearchPage,
});

function SearchPage() {
  const { t } = useI18n();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { hospitals: HOSPITALS } = useHospitals();
  const geo = useUserLocation();

  const update = (patch: Record<string, unknown>) =>
    navigate({ search: (prev: Record<string, unknown>) => ({ ...prev, ...patch }) as never });

  const results = useMemo(() => {
    const q = search.q.trim().toLowerCase();
    const list = HOSPITALS.filter((h) => {
      if (q && !(`${h.name} ${h.city} ${h.address} ${h.specialties.join(" ")}`.toLowerCase().includes(q))) return false;
      if (search.city && h.city !== search.city) return false;
      if (search.specialty && !h.specialties.includes(search.specialty as Specialty)) return false;
      if (search.emergency && !h.emergency) return false;
      if (search.icu && !h.icu) return false;
      if (search.ambulance && !h.ambulance) return false;
      if (search.open24_7 && !h.open24_7) return false;
      if (search.verified && !h.isVerified) return false;
      if (search.minRating > 0 && h.rating < search.minRating) return false;
      return true;
    });
    if (geo.loc) {
      return list
        .map((h) => ({ h, d: distanceKm(geo.loc!, h) }))
        .sort((a, b) => a.d - b.d);
    }
    // already ranked by useHospitals (verified → rating → reviews → completeness)
    return list.map((h) => ({ h, d: undefined as number | undefined }));
  }, [search, HOSPITALS, geo.loc]);

  const activeFiltersCount = [
    search.city, search.specialty, search.emergency, search.icu, search.ambulance, search.open24_7, search.verified, search.minRating > 0,
  ].filter(Boolean).length;

  const clearAll = () =>
    navigate({ search: { q: "", city: "", specialty: "", emergency: false, icu: false, ambulance: false, open24_7: false, verified: false, minRating: 0 } });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters sidebar */}
        <aside className="lg:w-72 lg:shrink-0">
          <div className="lg:sticky lg:top-24 rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold flex items-center gap-2"><SlidersHorizontal className="h-4 w-4" /> {t("filters")}</h2>
              {activeFiltersCount > 0 && (
                <button onClick={clearAll} className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                  <X className="h-3 w-3" /> {t("clear_filters")}
                </button>
              )}
            </div>

            <div className="mt-5 space-y-5">
              <div>
                <Label className="text-xs text-muted-foreground">{t("filter_city")}</Label>
                <Select value={search.city || "all"} onValueChange={(v) => update({ city: v === "all" ? "" : v })}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("all_cities")}</SelectItem>
                    {CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">{t("filter_specialty")}</Label>
                <Select value={search.specialty || "all"} onValueChange={(v) => update({ specialty: v === "all" ? "" : v })}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("all_specialties")}</SelectItem>
                    {SPECIALTIES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 pt-1">
                {[
                  { key: "verified", label: "Verified only", icon: <ShieldCheck className="h-3.5 w-3.5 text-primary" /> },
                  { key: "open24_7", label: t("filter_24_7") },
                  { key: "emergency", label: t("filter_emergency") },
                  { key: "icu", label: t("filter_icu") },
                  { key: "ambulance", label: t("filter_ambulance") },
                ].map((f) => (
                  <div key={f.key} className="flex items-center justify-between">
                    <Label htmlFor={f.key} className="text-sm font-normal cursor-pointer flex items-center gap-1.5">
                      {f.icon}{f.label}
                    </Label>
                    <Switch
                      id={f.key}
                      checked={Boolean(search[f.key as keyof typeof search])}
                      onCheckedChange={(v) => update({ [f.key]: v } as Partial<typeof search>)}
                    />
                  </div>
                ))}
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">{t("filter_min_rating")}</Label>
                <div className="mt-2 grid grid-cols-5 gap-1">
                  {[0, 3, 3.5, 4, 4.5].map((r) => (
                    <button
                      key={r}
                      onClick={() => update({ minRating: r })}
                      className={`rounded-md border px-2 py-1.5 text-xs font-medium transition-colors ${search.minRating === r ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:bg-secondary"}`}
                    >
                      {r === 0 ? "Any" : `${r}+`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1 min-w-0">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              value={search.q}
              onChange={(e) => update({ q: e.target.value })}
              placeholder={t("hero_search_placeholder")}
              className="h-12 pl-11 shadow-soft"
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">{results.length} {t("results")}</p>
            <Button size="sm" variant={geo.loc ? "secondary" : "outline"} onClick={geo.request} disabled={geo.loading}>
              {geo.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crosshair className="h-4 w-4" />}
              {geo.loc ? t("near_me_on") : t("near_me")}
            </Button>
          </div>

          {results.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-dashed border-border p-12 text-center">
              <p className="text-muted-foreground">{t("no_results")}</p>
              <Button onClick={clearAll} variant="outline" size="sm" className="mt-4">{t("clear_filters")}</Button>
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {results.map(({ h, d }) => <HospitalCard key={h.id} hospital={h} distanceKm={d} />)}
            </div>
          )}

          <div className="mt-8 text-center">
            <Button asChild variant="outline"><Link to="/">← {t("back")}</Link></Button>
          </div>
        </div>
      </div>
    </div>
  );
}
