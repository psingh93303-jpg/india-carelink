import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone, MapPin, Twitter, Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useSiteSettings } from "@/lib/site-settings";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — CareLink India" },
      { name: "description", content: "Get in touch with CareLink India — phone, email and social channels." },
      { property: "og:title", content: "Contact CareLink India" },
      { property: "og:description", content: "Get in touch with CareLink India — phone, email and social channels." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { lang, t } = useI18n();
  const { settings } = useSiteSettings();
  const intro = settings ? (lang === "hi" ? settings.contact_intro_hi : settings.contact_intro_en) : "";

  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{t("nav_contact")}</h1>
      {intro && <p className="mt-3 text-lg text-muted-foreground">{intro}</p>}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {settings?.contact_phone && (
          <a href={`tel:${settings.contact_phone}`} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft hover:bg-secondary/40 transition-colors">
            <Phone className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Phone</div>
              <div className="font-medium">{settings.contact_phone}</div>
            </div>
          </a>
        )}
        {settings?.contact_email && (
          <a href={`mailto:${settings.contact_email}`} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft hover:bg-secondary/40 transition-colors">
            <Mail className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Email</div>
              <div className="font-medium break-all">{settings.contact_email}</div>
            </div>
          </a>
        )}
        {settings?.contact_address && (
          <div className="sm:col-span-2 flex items-start gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft">
            <MapPin className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Address</div>
              <div className="font-medium">{settings.contact_address}</div>
            </div>
          </div>
        )}
      </div>

      {settings && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold mb-3">Social</h2>
          <div className="flex items-center gap-3">
            {settings.social_links.twitter && <a href={settings.social_links.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="flex h-10 w-10 items-center justify-center rounded-lg border border-border hover:bg-secondary"><Twitter className="h-4 w-4" /></a>}
            {settings.social_links.facebook && <a href={settings.social_links.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex h-10 w-10 items-center justify-center rounded-lg border border-border hover:bg-secondary"><Facebook className="h-4 w-4" /></a>}
            {settings.social_links.instagram && <a href={settings.social_links.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex h-10 w-10 items-center justify-center rounded-lg border border-border hover:bg-secondary"><Instagram className="h-4 w-4" /></a>}
            {settings.social_links.linkedin && <a href={settings.social_links.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="flex h-10 w-10 items-center justify-center rounded-lg border border-border hover:bg-secondary"><Linkedin className="h-4 w-4" /></a>}
            {settings.social_links.youtube && <a href={settings.social_links.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="flex h-10 w-10 items-center justify-center rounded-lg border border-border hover:bg-secondary"><Youtube className="h-4 w-4" /></a>}
            {!Object.values(settings.social_links).some(Boolean) && (
              <span className="text-sm text-muted-foreground">No social links configured yet.</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
