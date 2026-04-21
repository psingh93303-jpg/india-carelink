import { Activity, Twitter, Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { useSiteSettings } from "@/lib/site-settings";

export function Footer() {
  const { t, lang } = useI18n();
  const { settings } = useSiteSettings();

  const brand = settings ? (lang === "hi" ? settings.brand_name_hi : settings.brand_name) : t("brand");
  const links = settings?.footer_links ?? [];
  const social = settings?.social_links ?? {};
  const version = settings?.current_version ?? "v1.0.0";

  return (
    <footer className="border-t border-border/60 bg-secondary/40 mt-16">
      <div className="border-b border-border bg-muted">
        <div className="container mx-auto px-4 py-2 text-center text-xs font-medium text-muted-foreground">
          ⚠️ {t("testing_notice")}
        </div>
      </div>
      <div className="container mx-auto px-4 py-10 grid gap-8 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-hero text-primary-foreground">
              <Activity className="h-4 w-4" strokeWidth={2.5} />
            </span>
            <span className="font-semibold">{brand}</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground max-w-xs">{t("footer_note")}</p>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-3">Links</h4>
          <ul className="space-y-2 text-sm">
            {links.map((l) => (
              <li key={l.href}>
                <Link to={l.href} className="text-muted-foreground hover:text-foreground transition-colors">
                  {lang === "hi" ? l.label_hi : l.label_en}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-3">Connect</h4>
          <div className="flex items-center gap-3">
            {social.twitter && (
              <a href={social.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-muted-foreground hover:text-foreground"><Twitter className="h-4 w-4" /></a>
            )}
            {social.facebook && (
              <a href={social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-muted-foreground hover:text-foreground"><Facebook className="h-4 w-4" /></a>
            )}
            {social.instagram && (
              <a href={social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-muted-foreground hover:text-foreground"><Instagram className="h-4 w-4" /></a>
            )}
            {social.linkedin && (
              <a href={social.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-muted-foreground hover:text-foreground"><Linkedin className="h-4 w-4" /></a>
            )}
            {social.youtube && (
              <a href={social.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-muted-foreground hover:text-foreground"><Youtube className="h-4 w-4" /></a>
            )}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            {brand} <span className="mx-1">·</span> <span className="font-mono">{version}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
