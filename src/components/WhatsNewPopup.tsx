import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useSiteSettings } from "@/lib/site-settings";

const KEY = "carelink-last-seen-version";

export function WhatsNewPopup() {
  const { t, lang } = useI18n();
  const { settings } = useSiteSettings();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!settings || typeof window === "undefined") return;
    const seen = localStorage.getItem(KEY);
    // Only show on subsequent visits — skip the very first visit (handled by testing popup).
    if (seen && seen !== settings.current_version) {
      const id = setTimeout(() => setOpen(true), 1200);
      return () => clearTimeout(id);
    }
    if (!seen) {
      localStorage.setItem(KEY, settings.current_version);
    }
  }, [settings]);

  if (!settings) return null;
  const notes = lang === "hi" ? settings.whats_new_hi : settings.whats_new_en;

  const dismiss = () => {
    localStorage.setItem(KEY, settings.current_version);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) dismiss(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Sparkles className="h-6 w-6" />
          </div>
          <DialogTitle className="text-center">
            {t("whats_new_title")} <span className="font-mono text-sm text-muted-foreground">{settings.current_version}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="text-sm text-muted-foreground whitespace-pre-line">
          {notes || "—"}
        </div>
        <DialogFooter>
          <Button onClick={dismiss} variant="hero" className="w-full">{t("got_it")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
