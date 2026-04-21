import { createFileRoute } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useSiteSettings } from "@/lib/site-settings";

export const Route = createFileRoute("/disclaimer")({
  head: () => ({
    meta: [
      { title: "Disclaimer — CareLink India" },
      { name: "description", content: "Important disclaimer about the information provided on CareLink India." },
      { property: "og:title", content: "Disclaimer — CareLink India" },
      { property: "og:description", content: "Important disclaimer about the information provided on CareLink India." },
    ],
  }),
  component: DisclaimerPage,
});

function DisclaimerPage() {
  const { lang, t } = useI18n();
  const { settings, loading } = useSiteSettings();
  const body = settings ? (lang === "hi" ? settings.disclaimer_hi : settings.disclaimer_en) : "";

  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-warning/15 text-warning">
          <ShieldAlert className="h-5 w-5" />
        </span>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{t("nav_disclaimer")}</h1>
      </div>
      <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-soft">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <p className="text-base text-foreground/80 whitespace-pre-line leading-relaxed">{body || "—"}</p>
        )}
      </div>
    </div>
  );
}
