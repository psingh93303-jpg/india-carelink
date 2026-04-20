import { Link } from "@tanstack/react-router";
import { MapPin, Phone, Star, Siren, Clock, Ambulance, HeartPulse } from "lucide-react";
import type { Hospital } from "@/data/hospitals";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export function HospitalCard({ hospital, distanceKm }: { hospital: Hospital; distanceKm?: number }) {
  const { t } = useI18n();
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all hover:shadow-elegant hover:-translate-y-0.5">
      <div className="relative h-40 overflow-hidden bg-muted">
        <img
          src={hospital.image}
          alt={`${hospital.name} hospital exterior`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {hospital.featured && (
          <span className="absolute top-3 left-3 rounded-full bg-warning px-2.5 py-1 text-xs font-semibold text-warning-foreground shadow-soft">
            Featured
          </span>
        )}
        {distanceKm !== undefined && (
          <span className="absolute top-3 right-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-semibold backdrop-blur">
            {distanceKm.toFixed(1)} {t("km_away")}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-base leading-snug line-clamp-2">{hospital.name}</h3>
          <div className="flex shrink-0 items-center gap-1 rounded-md bg-success/10 px-2 py-1 text-xs font-semibold text-success">
            <Star className="h-3 w-3 fill-current" />
            {hospital.rating.toFixed(1)}
          </div>
        </div>

        <p className="mt-1 flex items-start gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span className="line-clamp-1">{hospital.city} · {hospital.address}</span>
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {hospital.open24_7 && (
            <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />{t("open_24_7")}</Badge>
          )}
          {hospital.emergency && (
            <Badge className="gap-1 bg-emergency/10 text-emergency hover:bg-emergency/15 border-0"><Siren className="h-3 w-3" />ER</Badge>
          )}
          {hospital.icu && (
            <Badge variant="secondary" className="gap-1"><HeartPulse className="h-3 w-3" />{t("has_icu")}</Badge>
          )}
          {hospital.ambulance && (
            <Badge variant="secondary" className="gap-1"><Ambulance className="h-3 w-3" />{t("has_ambulance")}</Badge>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-1">
          {hospital.specialties.slice(0, 3).map((s) => (
            <span key={s} className="rounded-md bg-accent px-2 py-0.5 text-xs text-accent-foreground">{s}</span>
          ))}
          {hospital.specialties.length > 3 && (
            <span className="rounded-md px-2 py-0.5 text-xs text-muted-foreground">+{hospital.specialties.length - 3}</span>
          )}
        </div>

        <div className="mt-auto flex gap-2 pt-4">
          <Button asChild size="sm" className="flex-1">
            <Link to="/hospital/$id" params={{ id: hospital.id }}>{t("view_details")}</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <a href={`tel:${hospital.phone}`} aria-label={`Call ${hospital.name}`}>
              <Phone className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </article>
  );
}
