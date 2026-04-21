import { useEffect, useState } from "react";
import { Download, X, Share } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "medifinder_install_dismissed";

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS Safari
      window.navigator.standalone === true;
    if (isStandalone) return;

    if (localStorage.getItem(DISMISS_KEY)) return;

    const ua = window.navigator.userAgent.toLowerCase();
    const iOS = /iphone|ipad|ipod/.test(ua) && !/crios|fxios/.test(ua);
    if (iOS) {
      setIsIOS(true);
      const t = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(t);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => {
      setShow(false);
      setDeferred(null);
    });
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const onInstall = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setShow(false);
  };

  const onDismiss = () => {
    setShow(false);
    localStorage.setItem(DISMISS_KEY, "1");
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md animate-in slide-in-from-bottom-4">
      <div className="relative rounded-2xl border border-border bg-card p-4 shadow-elegant">
        <button
          onClick={onDismiss}
          className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-start gap-3 pr-6">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-hero text-primary-foreground">
            <Download className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <div className="font-semibold text-foreground">Install MediFinder</div>
            {isIOS ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Tap <Share className="inline h-3.5 w-3.5 mx-0.5" /> Share, then{" "}
                <span className="font-medium">Add to Home Screen</span>.
              </p>
            ) : (
              <p className="mt-1 text-xs text-muted-foreground">
                Get fast access to hospitals & emergency care, right from your home screen.
              </p>
            )}
            {!isIOS && (
              <Button
                onClick={onInstall}
                size="sm"
                variant="hero"
                className="mt-3 w-full"
              >
                <Download className="h-4 w-4" />
                Install app
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
