import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Stethoscope, Sparkles, AlertTriangle, ExternalLink, Loader2, Siren, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useHospitals } from "@/hooks/useHospitals";
import { HospitalCard } from "@/components/HospitalCard";
import { useUserLocation, distanceKm } from "@/lib/geo";

export const Route = createFileRoute("/symptom-search")({
  head: () => ({
    meta: [
      { title: "AI Symptom Checker — CareLink India" },
      { name: "description", content: "Describe your symptoms to find the right specialty and nearest hospitals. Not a diagnosis." },
      { property: "og:title", content: "AI Symptom Checker — CareLink India" },
      { property: "og:description", content: "AI-assisted triage to point you to the right specialty and hospital." },
    ],
  }),
  component: SymptomSearchPage,
});

type TriageResult = {
  specialties: string[];
  urgency: "emergency" | "urgent" | "routine";
  explanation: string;
  tips: string[];
};

type TrustedLink = {
  id: string;
  title: string;
  title_hi: string | null;
  url: string;
  description: string;
  description_hi: string;
};

function SymptomSearchPage() {
  const { t, lang } = useI18n();
  const { hospitals } = useHospitals();
  const geo = useUserLocation();
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [links, setLinks] = useState<TrustedLink[]>([]);

  useEffect(() => {
    supabase
      .from("trusted_links")
      .select("id,title,title_hi,url,description,description_hi")
      .eq("active", true)
      .order("display_order")
      .then(({ data }) => setLinks((data ?? []) as TrustedLink[]));
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (symptoms.trim().length < 3) {
      toast.error(t("symptom_too_short"));
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("symptom-search", {
        body: { symptoms: symptoms.trim(), lang },
      });
      if (error) throw error;
      if ((data as { error?: string })?.error) {
        toast.error((data as { error: string }).error);
        return;
      }
      setResult(data as TriageResult);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "AI request failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const matchedHospitals = useMemo(() => {
    if (!result) return [];
    const wantEr = result.urgency === "emergency";
    const matches = hospitals.filter((h) => {
      if (wantEr && !h.emergency) return false;
      return h.specialties.some((s) => result.specialties.includes(s));
    });
    const sorted = geo.loc
      ? matches.map((h) => ({ h, d: distanceKm(geo.loc!, h) })).sort((a, b) => a.d - b.d)
      : matches.sort((a, b) => b.rating - a.rating).map((h) => ({ h, d: undefined as number | undefined }));
    return sorted.slice(0, 6);
  }, [result, hospitals, geo.loc]);

  const urgencyBadge = (u: TriageResult["urgency"]) => {
    if (u === "emergency") return { cls: "bg-emergency text-emergency-foreground", label: t("urgency_emergency") };
    if (u === "urgent") return { cls: "bg-warning text-warning-foreground", label: t("urgency_urgent") };
    return { cls: "bg-success/15 text-success", label: t("urgency_routine") };
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <header className="max-w-3xl">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium">
          <Sparkles className="h-3.5 w-3.5" /> {t("symptom_badge")}
        </span>
        <h1 className="mt-3 text-3xl md:text-4xl font-bold">{t("symptom_title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("symptom_subtitle")}</p>
      </header>

      <div className="mt-4 rounded-xl border border-warning/30 bg-warning/5 p-3 text-xs text-warning-foreground/90 flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
        <span>{t("symptom_disclaimer")}</span>
      </div>

      <form onSubmit={onSubmit} className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-soft">
        <label htmlFor="symptoms" className="text-sm font-medium">{t("symptom_label")}</label>
        <Textarea
          id="symptoms"
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          placeholder={t("symptom_placeholder")}
          rows={4}
          maxLength={1000}
          className="mt-2"
        />
        <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
          <p className="text-xs text-muted-foreground">{symptoms.length}/1000</p>
          <Button type="submit" disabled={loading} size="lg">
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" />{t("analyzing")}</> : <><Stethoscope className="h-4 w-4" />{t("symptom_analyze")}</>}
          </Button>
        </div>
      </form>

      {result && (
        <section className="mt-8 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${urgencyBadge(result.urgency).cls}`}>
                {result.urgency === "emergency" && <Siren className="h-3.5 w-3.5" />}
                {urgencyBadge(result.urgency).label}
              </span>
              {result.specialties.map((s) => (
                <span key={s} className="inline-flex rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold">{s}</span>
              ))}
            </div>
            <p className="mt-3 text-sm leading-relaxed">{result.explanation}</p>
            {result.urgency === "emergency" && (
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild variant="emergency"><a href="tel:108"><Siren className="h-4 w-4" /> Call 108</a></Button>
                <Button asChild variant="outline"><Link to="/emergency">{t("hero_cta_emergency")} <ArrowRight className="h-4 w-4" /></Link></Button>
              </div>
            )}
            {result.tips.length > 0 && (
              <ul className="mt-4 grid sm:grid-cols-2 gap-2 text-sm">
                {result.tips.map((tip, i) => (
                  <li key={i} className="rounded-lg bg-secondary/60 px-3 py-2">• {tip}</li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h2 className="text-xl font-bold">{t("symptom_matched_hospitals")}</h2>
            {matchedHospitals.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">{t("symptom_no_hospitals")}</p>
            ) : (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {matchedHospitals.map(({ h, d }) => <HospitalCard key={h.id} hospital={h} distanceKm={d} />)}
              </div>
            )}
          </div>

          {links.length > 0 && (
            <div>
              <h2 className="text-xl font-bold">{t("symptom_trusted_sources")}</h2>
              <ul className="mt-4 grid sm:grid-cols-2 gap-3">
                {links.map((l) => (
                  <li key={l.id}>
                    <a href={l.url} target="_blank" rel="noopener noreferrer"
                       className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 hover:border-primary/40 hover:shadow-soft transition-all">
                      <ExternalLink className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                      <div className="min-w-0">
                        <div className="font-semibold text-sm">{lang === "hi" && l.title_hi ? l.title_hi : l.title}</div>
                        <div className="text-xs text-muted-foreground line-clamp-2">{lang === "hi" ? l.description_hi || l.description : l.description}</div>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
