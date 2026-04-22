import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, MapPin, Phone, Star, FlaskConical, Home as HomeIcon, Clock, Loader2, Crosshair } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLabs, type Lab } from "@/hooks/useLabs";
import { useUserLocation, distanceKm } from "@/lib/geo";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/labs")({
  head: () => ({
    meta: [
      { title: "Pathology Labs — CareLink India" },
      { name: "description", content: "Find trusted pathology and diagnostic labs across India. Filter by 24/7, home collection and accreditation." },
      { property: "og:title", content: "Pathology Labs — CareLink India" },
      { property: "og:description", content: "Find trusted pathology and diagnostic labs across India." },
    ],
  }),
  component: LabsPage,
});

function LabsPage() {
  const { t } = useI18n();
  const { labs, loading } = useLabs();
  const geo = useUserLocation();
  const [q, setQ] = useState("");
  const [only247, setOnly247] = useState(false);
  const [onlyHome, setOnlyHome] = useState(false);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    let list = labs.filter((l) => {
      if (only247 && !l.open_24_7) return false;
      if (onlyHome && !l.home_collection) return false;
      if (s && !`${l.name} ${l.city} ${l.address} ${l.tests.join(" ")} ${l.accreditation}`.toLowerCase().includes(s)) return false;
      return true;
    });
    if (geo.loc) {
      list = list
        .map((l) => ({ ...l, _d: distanceKm(geo.loc!, l) }))
        .sort((a, b) => (a as Lab & { _d: number })._d - (b as Lab & { _d: number })._d);
    }
    return list;
  }, [labs, q, only247, onlyHome, geo.loc]);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="max-w-3xl">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium">
          <FlaskConical className="h-3.5 w-3.5" /> {t("labs_badge")}
        </span>
        <h1 className="mt-3 text-3xl md:text-4xl font-bold">{t("labs_title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("labs_subtitle")}</p>
      </header>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("labs_search_placeholder")} className="h-11 pl-11" />
        </div>
        <Button variant={geo.loc ? "secondary" : "outline"} onClick={geo.request} disabled={geo.loading}>
          {geo.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crosshair className="h-4 w-4" />}
          {geo.loc ? t("near_me_on") : t("near_me")}
        </Button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <FilterChip active={only247} onClick={() => setOnly247((v) => !v)} label={t("open_24_7")} icon={<Clock className="h-3.5 w-3.5" />} />
        <FilterChip active={onlyHome} onClick={() => setOnlyHome((v) => !v)} label={t("home_collection")} icon={<HomeIcon className="h-3.5 w-3.5" />} />
      </div>

      {loading ? (
        <div className="mt-10 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : results.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
          {labs.length === 0 ? t("labs_empty") : t("no_results")}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {results.map((l) => (
            <LabCard key={l.id} lab={l} dist={(l as Lab & { _d?: number })._d} />
          ))}
        </div>
      )}

      <div className="mt-8">
        <Button asChild variant="outline"><Link to="/">← {t("back")}</Link></Button>
      </div>
    </div>
  );
}

function FilterChip({ active, onClick, label, icon }: { active: boolean; onClick: () => void; label: string; icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
        active ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:bg-secondary"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function LabCard({ lab, dist }: { lab: Lab; dist?: number }) {
  const { t } = useI18n();
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <div className="relative h-36 bg-muted">
        {lab.image ? (
          <img src={lab.image} alt={`${lab.name} pathology lab`} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground"><FlaskConical className="h-10 w-10" /></div>
        )}
        {lab.featured && (
          <span className="absolute top-3 left-3 rounded-full bg-warning px-2.5 py-1 text-xs font-semibold text-warning-foreground">Featured</span>
        )}
        {dist !== undefined && (
          <span className="absolute top-3 right-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-semibold backdrop-blur">
            {dist.toFixed(1)} {t("km_away")}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-snug line-clamp-2">{lab.name}</h3>
          {lab.rating > 0 && (
            <div className="flex shrink-0 items-center gap-1 rounded-md bg-success/10 px-2 py-1 text-xs font-semibold text-success">
              <Star className="h-3 w-3 fill-current" />{lab.rating.toFixed(1)}
            </div>
          )}
        </div>
        <p className="mt-1 flex items-start gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span className="line-clamp-1">{lab.city} · {lab.address}</span>
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {lab.open_24_7 && <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />{t("open_24_7")}</Badge>}
          {lab.home_collection && <Badge variant="secondary" className="gap-1"><HomeIcon className="h-3 w-3" />{t("home_collection")}</Badge>}
          {lab.accreditation && <Badge variant="outline" className="text-xs">{lab.accreditation}</Badge>}
        </div>
        {lab.tests.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {lab.tests.slice(0, 4).map((t) => (
              <span key={t} className="rounded-md bg-accent px-2 py-0.5 text-xs text-accent-foreground">{t}</span>
            ))}
            {lab.tests.length > 4 && <span className="text-xs text-muted-foreground px-1">+{lab.tests.length - 4}</span>}
          </div>
        )}
        <div className="mt-auto pt-4 flex gap-2">
          {lab.phone && (
            <Button asChild size="sm" className="flex-1">
              <a href={`tel:${lab.phone}`}><Phone className="h-4 w-4" /> {t("call_now")}</a>
            </Button>
          )}
          <Button asChild size="sm" variant="outline">
            <a href={`https://www.google.com/maps/dir/?api=1&destination=${lab.lat},${lab.lng}`} target="_blank" rel="noreferrer">
              <MapPin className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </article>
  );
}
