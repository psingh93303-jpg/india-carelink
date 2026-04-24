import { Link, useRouterState } from "@tanstack/react-router";
import { Activity, Menu, Globe, Siren, LogIn, LogOut, Shield, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { getRoleDashboardPath, useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function Header() {
  const { t, lang, setLang } = useI18n();
  const { user, roles, isStaff, signOut } = useAuth();
  const { location } = useRouterState();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cmsLinks, setCmsLinks] = useState<{ slug: string; title: string }[]>([]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    (supabase as any)
      .from("cms_pages")
      .select("slug,title")
      .eq("status", "published")
      .order("title")
      .then(({ data }: { data: { slug: string; title: string }[] | null }) => setCmsLinks(data ?? []));
  }, [user?.id, roles.join(",")]);

  const links = [
    { to: "/", label: t("nav_home") },
    { to: "/search", label: t("nav_search") },
    { to: "/symptom-search", label: t("nav_symptom") },
    { to: "/labs", label: t("nav_labs") },
    { to: "/emergency", label: t("nav_emergency") },
    { to: "/about", label: t("nav_about") },
    { to: "/contact", label: t("nav_contact") },
  ] as const;

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "U";

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b bg-background/80 backdrop-blur-lg transition-shadow",
        scrolled ? "border-border shadow-soft" : "border-border/60",
      )}
    >
      <div className="container mx-auto flex h-16 items-center gap-2 px-3 sm:px-4">
        {/* Left: logo */}
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-hero text-primary-foreground shadow-elegant transition-transform group-hover:scale-105">
            <Activity className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <span className="font-bold text-base sm:text-lg tracking-tight whitespace-nowrap">{t("brand")}</span>
        </Link>

        {/* Center: desktop nav */}
        <nav className="hidden lg:flex items-center gap-1 mx-auto min-w-0">
          {links.map((l) => {
            const active = location.pathname === l.to || (l.to !== "/" && location.pathname.startsWith(l.to));
            return (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                  active ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
                )}
              >
                {l.label}
              </Link>
            );
          })}
          {cmsLinks.slice(0, 3).map((l) => (
            <Link key={l.slug} to="/pages/$slug" params={{ slug: l.slug }} className="px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap text-muted-foreground hover:text-foreground hover:bg-secondary/60">
              {l.title}
            </Link>
          ))}
        </nav>

        {/* Right: language + emergency + auth + hamburger */}
        <div className="flex items-center gap-1.5 sm:gap-2 ml-auto lg:ml-0 shrink-0">
          <button
            onClick={() => setLang(lang === "en" ? "hi" : "en")}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium hover:bg-secondary transition-colors"
            aria-label="Toggle language"
          >
            <Globe className="h-4 w-4" />
            {lang === "en" ? "हिं" : "EN"}
          </button>
          <Button asChild variant="emergency" size="sm" className="hidden sm:inline-flex">
            <Link to="/emergency">
              <Siren className="h-4 w-4" />
              <span className="hidden md:inline">{t("nav_emergency")}</span>
            </Link>
          </Button>

          {/* Auth — ALWAYS visible on every breakpoint */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="Account"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-hero text-primary-foreground text-xs font-semibold shadow-soft hover:opacity-90 transition-opacity"
                >
                  {initials}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-xs text-muted-foreground truncate">{user.email}</div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile"><UserIcon className="h-4 w-4" /> My profile</Link>
                </DropdownMenuItem>
                {isStaff && (
                  <DropdownMenuItem asChild>
                    <Link to={getRoleDashboardPath(roles)}><Shield className="h-4 w-4" /> Dashboard</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm" variant="default">
              <Link to="/auth">
                <LogIn className="h-4 w-4" />
                <span className="hidden xs:inline sm:inline">Sign in</span>
              </Link>
            </Button>
          )}

          {/* Mobile hamburger — does NOT contain Login (login stays in header) */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div className="mt-8 flex flex-col gap-1">
                {links.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-3 text-base font-medium hover:bg-secondary"
                  >
                    {l.label}
                  </Link>
                ))}
                {cmsLinks.map((l) => (
                  <Link key={l.slug} to="/pages/$slug" params={{ slug: l.slug }} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-base font-medium hover:bg-secondary">
                    {l.title}
                  </Link>
                ))}
                <button
                  onClick={() => setLang(lang === "en" ? "hi" : "en")}
                  className="mt-3 flex items-center gap-2 rounded-lg border border-border px-3 py-3 text-base font-medium"
                >
                  <Globe className="h-4 w-4" />
                  {lang === "en" ? "हिंदी" : "English"}
                </button>
                <Link
                  to="/emergency"
                  onClick={() => setOpen(false)}
                  className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-emergency px-3 py-3 text-base font-semibold text-emergency-foreground"
                >
                  <Siren className="h-4 w-4" />
                  {t("nav_emergency")}
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
