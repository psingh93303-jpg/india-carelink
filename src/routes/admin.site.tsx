import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Save, Sparkles, Globe, Phone, FileText, Link2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { fetchSiteSettings, invalidateSiteSettings, type FooterLink, type SiteSettings } from "@/lib/site-settings";

export const Route = createFileRoute("/admin/site")({
  component: AdminSitePage,
});

function AdminSitePage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSiteSettings().then((s) => setSettings(s));
  }, []);

  if (!settings) return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;

  const update = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) =>
    setSettings({ ...settings, [k]: v });

  const save = async () => {
    setSaving(true);
    const { id, ...patch } = settings;
    const { error } = await supabase.from("site_settings").update({
      ...patch,
      social_links: settings.social_links as never,
      footer_links: settings.footer_links as never,
    }).eq("id", id);
    setSaving(false);
    if (error) {
      toast.error("Save failed: " + error.message);
      return;
    }
    invalidateSiteSettings();
    toast.success("Settings saved");
  };

  const recordVersion = async () => {
    const { error } = await supabase.from("version_history").upsert({
      version: settings.current_version,
      notes_en: settings.whats_new_en,
      notes_hi: settings.whats_new_hi,
    }, { onConflict: "version" });
    if (error) toast.error("Could not record version: " + error.message);
    else toast.success(`Version ${settings.current_version} recorded`);
  };

  const updateFooterLink = (idx: number, patch: Partial<FooterLink>) => {
    const next = [...settings.footer_links];
    next[idx] = { ...next[idx], ...patch };
    update("footer_links", next);
  };
  const addFooterLink = () =>
    update("footer_links", [...settings.footer_links, { label_en: "", label_hi: "", href: "/" }]);
  const removeFooterLink = (idx: number) =>
    update("footer_links", settings.footer_links.filter((_, i) => i !== idx));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Site Settings</h1>
          <p className="text-sm text-muted-foreground">Manage branding, legal pages, contact info, footer links, and version.</p>
        </div>
        <Button onClick={save} disabled={saving} variant="hero">
          <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>

      <Tabs defaultValue="brand" className="w-full">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="brand"><Globe className="h-4 w-4" />Brand</TabsTrigger>
          <TabsTrigger value="legal"><FileText className="h-4 w-4" />Legal Pages</TabsTrigger>
          <TabsTrigger value="contact"><Phone className="h-4 w-4" />Contact</TabsTrigger>
          <TabsTrigger value="footer"><Link2 className="h-4 w-4" />Footer Links</TabsTrigger>
          <TabsTrigger value="version"><Sparkles className="h-4 w-4" />Version</TabsTrigger>
        </TabsList>

        <TabsContent value="brand" className="space-y-4 mt-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Brand name (EN)"><Input value={settings.brand_name} onChange={(e) => update("brand_name", e.target.value)} /></Field>
            <Field label="Brand name (HI)"><Input value={settings.brand_name_hi} onChange={(e) => update("brand_name_hi", e.target.value)} /></Field>
            <Field label="Tagline (EN)"><Input value={settings.tagline_en} onChange={(e) => update("tagline_en", e.target.value)} /></Field>
            <Field label="Tagline (HI)"><Input value={settings.tagline_hi} onChange={(e) => update("tagline_hi", e.target.value)} /></Field>
          </div>
        </TabsContent>

        <TabsContent value="legal" className="space-y-4 mt-4">
          <Field label="Disclaimer (EN)"><Textarea rows={8} value={settings.disclaimer_en} onChange={(e) => update("disclaimer_en", e.target.value)} /></Field>
          <Field label="Disclaimer (HI)"><Textarea rows={8} value={settings.disclaimer_hi} onChange={(e) => update("disclaimer_hi", e.target.value)} /></Field>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4 mt-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Intro (EN)"><Textarea rows={3} value={settings.contact_intro_en} onChange={(e) => update("contact_intro_en", e.target.value)} /></Field>
            <Field label="Intro (HI)"><Textarea rows={3} value={settings.contact_intro_hi} onChange={(e) => update("contact_intro_hi", e.target.value)} /></Field>
            <Field label="Phone"><Input value={settings.contact_phone} onChange={(e) => update("contact_phone", e.target.value)} /></Field>
            <Field label="Email"><Input value={settings.contact_email} onChange={(e) => update("contact_email", e.target.value)} /></Field>
            <Field label="Address" className="sm:col-span-2"><Input value={settings.contact_address} onChange={(e) => update("contact_address", e.target.value)} /></Field>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold mb-3">Social links</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {(["twitter", "facebook", "instagram", "linkedin", "youtube"] as const).map((k) => (
                <Field key={k} label={k[0].toUpperCase() + k.slice(1)}>
                  <Input
                    value={settings.social_links[k] ?? ""}
                    placeholder="https://…"
                    onChange={(e) => update("social_links", { ...settings.social_links, [k]: e.target.value })}
                  />
                </Field>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="footer" className="space-y-3 mt-4">
          <p className="text-sm text-muted-foreground">Links shown in the site footer. Use internal paths like <code>/about</code> or external <code>https://…</code>.</p>
          <div className="space-y-2">
            {settings.footer_links.map((l, i) => (
              <div key={i} className="grid sm:grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end rounded-xl border border-border bg-card p-3">
                <Field label="Label (EN)"><Input value={l.label_en} onChange={(e) => updateFooterLink(i, { label_en: e.target.value })} /></Field>
                <Field label="Label (HI)"><Input value={l.label_hi} onChange={(e) => updateFooterLink(i, { label_hi: e.target.value })} /></Field>
                <Field label="Href"><Input value={l.href} onChange={(e) => updateFooterLink(i, { href: e.target.value })} /></Field>
                <Button variant="outline" size="sm" onClick={() => removeFooterLink(i)}>Remove</Button>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={addFooterLink}>+ Add link</Button>
        </TabsContent>

        <TabsContent value="version" className="space-y-4 mt-4">
          <Field label="Current version (e.g. v1.2.0)"><Input value={settings.current_version} onChange={(e) => update("current_version", e.target.value)} /></Field>
          <Field label="What's new (EN)"><Textarea rows={6} value={settings.whats_new_en} onChange={(e) => update("whats_new_en", e.target.value)} /></Field>
          <Field label="What's new (HI)"><Textarea rows={6} value={settings.whats_new_hi} onChange={(e) => update("whats_new_hi", e.target.value)} /></Field>
          <div className="rounded-xl border border-border bg-secondary/30 p-4 text-sm">
            <p className="mb-2 text-muted-foreground">After bumping the version and saving, click below to record this entry in version history. The "What's New" popup shows automatically to returning users when the version changes.</p>
            <Button variant="outline" size="sm" onClick={recordVersion}><Sparkles className="h-4 w-4" />Record this version</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
