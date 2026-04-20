import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Phone, Star, Siren, Clock, Ambulance, HeartPulse, ExternalLink, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";
import { getHospitalById } from "@/data/hospitals";
import { MapView } from "@/components/MapView";

export const Route = createFileRoute("/hospital/$id")({
  loader: ({ params }) => {
    const hospital = getHospitalById(params.id);
    if (!hospital) throw notFound();
    return { hospital };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.hospital.name}, ${loaderData.hospital.city} — MediFinder` },
          { name: "description", content: loaderData.hospital.about },
          { property: "og:title", content: `${loaderData.hospital.name} — ${loaderData.hospital.city}` },
          { property: "og:description", content: loaderData.hospital.about },
          { property: "og:image", content: loaderData.hospital.image },
        ]
      : [],
  }),
  errorComponent: ({ error }) => (
    <div className="container mx-auto px-4 py-16 text-center">
      <p className="text-muted-foreground">{error.message}</p>
      <Button asChild className="mt-4"><Link to="/">Go home</Link></Button>
    </div>
  ),
  notFoundComponent: () => {
    const { t } = useI18n();
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">{t("not_found_title")}</h1>
        <Button asChild className="mt-4"><Link to="/">{t("go_home")}</Link></Button>
      </div>
    );
  },
  component: HospitalPage,
});

function HospitalPage() {
  const { hospital } = Route.useLoaderData();
  const { t } = useI18n();
  const mapsUrl = `https://www.openstreetmap.org/?mlat=${hospital.lat}&mlon=${hospital.lng}#map=17/${hospital.lat}/${hospital.lng}`;

  return (
    <div>
      {/* Hero image */}
      <div className="relative h-64 md:h-80 overflow-hidden bg-muted">
        <img src={hospital.image} alt={`${hospital.name}`} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute top-4 left-4">
          <Button asChild variant="secondary" size="sm" className="backdrop-blur bg-background/80">
            <Link to="/search" search={{ q: "", city: "", specialty: "", emergency: false, icu: false, ambulance: false, open24_7: false, minRating: 0 }}>
              <ArrowLeft className="h-4 w-4" /> {t("back")}
            </Link>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-16 relative">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-elegant">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{hospital.name}</h1>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" /> {hospital.address}
                  </p>
                </div>
                <div className="flex items-center gap-1 rounded-lg bg-success/10 px-3 py-1.5 text-success font-semibold">
                  <Star className="h-4 w-4 fill-current" />
                  {hospital.rating.toFixed(1)}
                  <span className="text-xs text-success/70 font-normal ml-1">({hospital.reviews.toLocaleString()} {t("reviews")})</span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {hospital.open24_7 && <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />{t("open_24_7")}</Badge>}
                {hospital.emergency && <Badge className="gap-1 bg-emergency/10 text-emergency hover:bg-emergency/15 border-0"><Siren className="h-3 w-3" />Emergency</Badge>}
                {hospital.icu && <Badge variant="secondary" className="gap-1"><HeartPulse className="h-3 w-3" />{t("has_icu")}</Badge>}
                {hospital.ambulance && <Badge variant="secondary" className="gap-1"><Ambulance className="h-3 w-3" />{t("has_ambulance")}</Badge>}
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <Button asChild variant="hero" size="lg" className="flex-1 sm:flex-none">
                  <a href={`tel:${hospital.phone}`}><Phone className="h-4 w-4" />{t("call_now")}</a>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a href={mapsUrl} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-4 w-4" />{t("get_directions")}
                  </a>
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <h2 className="font-semibold text-lg">{t("about")}</h2>
              <p className="mt-2 text-muted-foreground leading-relaxed">{hospital.about}</p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <h2 className="font-semibold text-lg flex items-center gap-2"><Stethoscope className="h-5 w-5 text-primary" /> {t("services")}</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {hospital.specialties.map((s: string) => (
                  <span key={s} className="rounded-lg bg-accent px-3 py-1.5 text-sm text-accent-foreground">{s}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <h2 className="font-semibold text-lg">{t("location")}</h2>
              <div className="mt-3">
                <MapView points={[{ id: hospital.id, name: hospital.name, lat: hospital.lat, lng: hospital.lng, emergency: hospital.emergency }]} height={300} />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{hospital.address}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
