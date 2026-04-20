import { Activity } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-border/60 bg-secondary/40 mt-16">
      <div className="container mx-auto px-4 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-hero text-primary-foreground">
            <Activity className="h-4 w-4" strokeWidth={2.5} />
          </span>
          <span className="font-semibold">{t("brand")}</span>
        </div>
        <p className="text-sm text-muted-foreground max-w-md">{t("footer_note")}</p>
      </div>
    </footer>
  );
}
