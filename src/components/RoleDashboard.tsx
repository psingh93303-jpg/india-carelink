import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { Activity, ArrowLeft, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

type DashboardAction = { label: string; to: string; icon: LucideIcon };
type DashboardMetric = { label: string; value: string; icon: LucideIcon };

export function RoleDashboard({
  title,
  subtitle,
  badge,
  actions,
  metrics,
}: {
  title: string;
  subtitle: string;
  badge: string;
  actions: DashboardAction[];
  metrics: DashboardMetric[];
}) {
  const { user, signOut } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <div className="flex items-center gap-2 px-2 pb-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-hero text-primary-foreground">
                <Activity className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground">{badge}</div>
                <div className="truncate text-sm font-semibold">{user?.email}</div>
              </div>
            </div>
            <nav className="space-y-1">
              {actions.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-4 space-y-2 border-t border-border pt-4">
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link to="/">
                  <ArrowLeft className="h-4 w-4" /> Back to site
                </Link>
              </Button>
              <Button onClick={signOut} variant="ghost" size="sm" className="w-full text-muted-foreground">
                <LogOut className="h-4 w-4" /> Sign out
              </Button>
            </div>
          </div>
        </aside>

        <main className="min-w-0 space-y-8">
          <section>
            <p className="text-sm font-medium text-primary">{badge}</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">{title}</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.label} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-muted-foreground">{metric.label}</span>
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                  </div>
                  <div className="mt-4 text-2xl font-bold tracking-tight">{metric.value}</div>
                </div>
              );
            })}
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h2 className="text-lg font-semibold">Quick actions</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {actions.map((item) => {
                const Icon = item.icon;
                return (
                  <Button key={item.label} asChild variant="outline" className="justify-start">
                    <Link to={item.to}>
                      <Icon className="h-4 w-4" /> {item.label}
                    </Link>
                  </Button>
                );
              })}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}