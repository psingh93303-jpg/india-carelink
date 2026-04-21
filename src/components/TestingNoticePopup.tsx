import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

const KEY = "carelink-testing-notice-seen";

export function TestingNoticePopup() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(KEY)) {
      const id = setTimeout(() => setOpen(true), 600);
      return () => clearTimeout(id);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(KEY, "1");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) dismiss(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-warning/15 text-warning">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <DialogTitle className="text-center">Testing Phase / परीक्षण चरण</DialogTitle>
          <DialogDescription className="text-center pt-2 space-y-2">
            <span className="block">{t("testing_notice")}</span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={dismiss} variant="hero" className="w-full">{t("got_it")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
