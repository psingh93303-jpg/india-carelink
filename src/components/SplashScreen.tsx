import { useEffect, useState } from "react";
import { Activity } from "lucide-react";

const SPLASH_KEY = "medifinder_splash_shown";

export function SplashScreen() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Only show on standalone (installed) launches, or first visit per session
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS Safari
      window.navigator.standalone === true;
    const alreadyShown = sessionStorage.getItem(SPLASH_KEY);
    if (!alreadyShown || isStandalone) {
      setVisible(true);
      sessionStorage.setItem(SPLASH_KEY, "1");
      const t = setTimeout(() => setVisible(false), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-hero animate-in fade-in"
      style={{ animationDuration: "200ms" }}
    >
      <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white/15 backdrop-blur-sm shadow-elegant animate-pulse">
        <Activity className="h-12 w-12 text-primary-foreground" strokeWidth={2.5} />
      </div>
      <div className="mt-6 text-2xl font-bold text-primary-foreground tracking-tight">
        MediFinder
      </div>
      <div className="mt-2 text-sm text-primary-foreground/80">
        Care, when you need it most
      </div>
    </div>
  );
}
