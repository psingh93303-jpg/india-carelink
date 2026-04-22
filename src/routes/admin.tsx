import { createFileRoute, Link, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LayoutDashboard, Building2, MessageSquare, Users, LogOut, Activity, ArrowLeft, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ location }) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw redirect({ to: "/auth", search: { redirect: location.pathname } });
    }
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id);
    const allowed = ["admin", "manager", "hospital_manager", "financial_manager"];
    if (!roles?.some((r) => allowed.includes(r.role))) {
      throw redirect({ to: "/admin/forbidden" });
    }
  },
  component: AdminLayout,
});

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean; show: (a: ReturnType<typeof useAuth>) => boolean };

const NAV: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true, show: () => true },
  { to: "/admin/hospitals", label: "Hospitals", icon: Building2, show: (a) => a.canEditHospital || a.isStaff },
  { to: "/admin/reviews", label: "Reviews", icon: MessageSquare, show: (a) => a.canEditHospital || a.isAdmin },
  { to: "/admin/users", label: "Users", icon: Users, show: (a) => a.canManageUsers },
  { to: "/admin/site", label: "Site Settings", icon: Settings, show: (a) => a.isAdmin },
];

function AdminLayout() {
  const auth = useAuth();
  const { signOut, user } = auth;
  const { location } = useRouterState();
  const [pendingCount, setPendingCount] = useState<number>(0);

  useEffect(() => {
    supabase
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending")
      .then(({ count }) => setPendingCount(count ?? 0));
  }, [location.pathname]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <div className="flex items-center gap-2 px-2 pb-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-hero text-primary-foreground">
                <Activity className="h-4 w-4" />
              </span>
              <div>
                <div className="text-xs text-muted-foreground">Admin Portal</div>
                <div className="text-sm font-semibold truncate max-w-[140px]">{user?.email}</div>
              </div>
            </div>
            <nav className="mt-2 space-y-1">
              {NAV.filter((i) => i.show(auth)).map((item) => {
                const active = item.exact
                  ? location.pathname === item.to
                  : location.pathname.startsWith(item.to);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </span>
                    {item.to === "/admin/reviews" && pendingCount > 0 && (
                      <span className={cn("rounded-full px-2 py-0.5 text-xs", active ? "bg-primary-foreground/20" : "bg-warning text-warning-foreground")}>
                        {pendingCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-4 border-t pt-4 space-y-2">
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link to="/"><ArrowLeft className="h-4 w-4" /> Back to site</Link>
              </Button>
              <Button onClick={signOut} variant="ghost" size="sm" className="w-full text-muted-foreground">
                <LogOut className="h-4 w-4" /> Sign out
              </Button>
            </div>
          </div>
        </aside>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
