import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Phone, Star, Siren, Clock, Ambulance, HeartPulse, ExternalLink, Stethoscope, Building2, Users as UsersIcon, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";
import { fetchHospitalById } from "@/lib/hospitals-api";
import { MapView } from "@/components/MapView";
import { HospitalReviews } from "@/components/HospitalReviews";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/hospital/$id")({
  loader: async ({ params }) => {
    const hospital = await fetchHospitalById(params.id);
    if (!hospital) throw notFound();
    const [d, dr, s] = await Promise.all([
      supabase.from("departments").select("*").eq("hospital_id", params.id).order("display_order").order("name"),
      supabase.from("doctors").select("*").eq("hospital_id", params.id).order("display_order").order("name"),
      supabase.from("hospital_staff").select("*").eq("hospital_id", params.id).order("display_order").order("name"),
    ]);
    return { hospital, departments: d.data ?? [], doctors: dr.data ?? [], staff: s.data ?? [] };
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
  const { hospital, departments, doctors, staff } = Route.useLoaderData();
  const { t } = useI18n();
  const mapsUrl = `https://www.openstreetmap.org/?mlat=${hospital.lat}&mlon=${hospital.lng}#map=17/${hospital.lat}/${hospital.lng}`;
  const deptName = (id: string | null) => departments.find((d) => d.id === id)?.name ?? null;

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
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2 flex-wrap">
                    <span>{hospital.name}</span>
                    {hospital.isVerified && <VerifiedBadge size="lg" />}
                  </h1>
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

            {departments.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
                <h2 className="font-semibold text-lg flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" /> {t("departments")}</h2>
                <div className="mt-4 grid sm:grid-cols-2 gap-3">
                  {departments.map((d) => (
                    <div key={d.id} className="rounded-xl border border-border p-4">
                      <div className="font-semibold">{d.name}</div>
                      {d.head_doctor && <div className="mt-1 text-sm text-muted-foreground">{t("head_doctor")}: {d.head_doctor}</div>}
                      {d.description && <p className="mt-2 text-sm text-muted-foreground">{d.description}</p>}
                      {d.phone && <a href={`tel:${d.phone}`} className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline"><Phone className="h-3 w-3" /> {d.phone}</a>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {doctors.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
                <h2 className="font-semibold text-lg flex items-center gap-2"><Stethoscope className="h-5 w-5 text-primary" /> {t("doctors")}</h2>
                <div className="mt-4 grid sm:grid-cols-2 gap-3">
                  {doctors.map((doc) => (
                    <div key={doc.id} className="rounded-xl border border-border p-4 flex gap-3">
                      {doc.photo_url ? (
                        <img src={doc.photo_url} alt={doc.name} className="h-14 w-14 rounded-full object-cover flex-shrink-0 bg-muted" />
                      ) : (
                        <div className="h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-semibold">
                          {doc.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold truncate">{doc.name}</div>
                        {doc.qualification && <div className="text-xs text-muted-foreground truncate">{doc.qualification}</div>}
                        {doc.specialty && <div className="text-sm text-primary mt-0.5 truncate">{doc.specialty}</div>}
                        {deptName(doc.department_id) && <div className="text-xs text-muted-foreground mt-0.5">{deptName(doc.department_id)}</div>}
                        {doc.consultation_hours && <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Clock className="h-3 w-3" />{doc.consultation_hours}</div>}
                        <div className="mt-1 flex flex-wrap gap-3 text-xs">
                          {doc.phone && <a href={`tel:${doc.phone}`} className="text-primary hover:underline inline-flex items-center gap-1"><Phone className="h-3 w-3" />{doc.phone}</a>}
                          {doc.email && <a href={`mailto:${doc.email}`} className="text-primary hover:underline inline-flex items-center gap-1"><Mail className="h-3 w-3" />{doc.email}</a>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {staff.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
                <h2 className="font-semibold text-lg flex items-center gap-2"><UsersIcon className="h-5 w-5 text-primary" /> {t("staff")}</h2>
                <ul className="mt-3 divide-y divide-border">
                  {staff.map((s) => (
                    <li key={s.id} className="py-3 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="font-medium">{s.name}</div>
                        {s.role_title && <div className="text-xs text-muted-foreground">{s.role_title}</div>}
                      </div>
                      <div className="flex gap-3 text-xs">
                        {s.phone && <a href={`tel:${s.phone}`} className="text-primary hover:underline inline-flex items-center gap-1"><Phone className="h-3 w-3" />{s.phone}</a>}
                        {s.email && <a href={`mailto:${s.email}`} className="text-primary hover:underline inline-flex items-center gap-1"><Mail className="h-3 w-3" />{s.email}</a>}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <HospitalReviews hospitalId={hospital.id} />
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
