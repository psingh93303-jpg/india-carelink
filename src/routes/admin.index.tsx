import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Building2, MessageSquare, Users, Star, Loader2, MapPin, Siren } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Dashboard — Admin · MediFinder" }] }),
  component: DashboardPage,
});

type Stats = {
  hospitals: number;
  cities: number;
  reviewsTotal: number;
  reviewsPending: number;
  reviewsApproved: number;
  users: number;
  emergency: number;
  avgRating: number;
  topCities: { city: string; count: number }[];
};

function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    (async () => {
      const [h, r, rp, ra, u, em] = await Promise.all([
        supabase.from("hospitals").select("id, city, rating", { count: "exact" }),
        supabase.from("reviews").select("id", { count: "exact", head: true }),
        supabase.from("reviews").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("reviews").select("id", { count: "exact", head: true }).eq("status", "approved"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("hospitals").select("id", { count: "exact", head: true }).eq("emergency", true),
      ]);
      const rows = (h.data ?? []) as { city: string; rating: number }[];
      const cityMap = new Map<string, number>();
      let ratingSum = 0;
      for (const row of rows) {
        cityMap.set(row.city, (cityMap.get(row.city) ?? 0) + 1);
        ratingSum += Number(row.rating);
      }
      const topCities = [...cityMap.entries()]
        .map(([city, count]) => ({ city, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);

      setStats({
        hospitals: h.count ?? rows.length,
        cities: cityMap.size,
        reviewsTotal: r.count ?? 0,
        reviewsPending: rp.count ?? 0,
        reviewsApproved: ra.count ?? 0,
        users: u.count ?? 0,
        emergency: em.count ?? 0,
        avgRating: rows.length ? ratingSum / rows.length : 0,
        topCities,
      });
    })();
  }, []);

  if (!stats) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const cards = [
    { label: "Hospitals", value: stats.hospitals, icon: Building2, accent: "bg-primary/10 text-primary" },
    { label: "Cities", value: stats.cities, icon: MapPin, accent: "bg-accent text-accent-foreground" },
    { label: "Users", value: stats.users, icon: Users, accent: "bg-success/10 text-success" },
    { label: "Reviews", value: stats.reviewsTotal, icon: MessageSquare, accent: "bg-warning/15 text-warning-foreground" },
    { label: "Pending reviews", value: stats.reviewsPending, icon: MessageSquare, accent: "bg-warning/20 text-warning-foreground" },
    { label: "Emergency hospitals", value: stats.emergency, icon: Siren, accent: "bg-emergency/10 text-emergency" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Overview of MediFinder data and activity.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{c.label}</span>
              <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${c.accent}`}>
                <c.icon className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3 text-3xl font-bold tracking-tight">{c.value.toLocaleString()}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="font-semibold">Average rating</h2>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-4xl font-bold">{stats.avgRating.toFixed(2)}</span>
            <Star className="h-6 w-6 fill-warning text-warning" />
            <span className="text-sm text-muted-foreground">across {stats.hospitals} hospitals</span>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-muted p-3">
              <div className="text-muted-foreground">Approved reviews</div>
              <div className="mt-1 text-xl font-semibold">{stats.reviewsApproved}</div>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <div className="text-muted-foreground">Pending</div>
              <div className="mt-1 text-xl font-semibold">{stats.reviewsPending}</div>
            </div>
          </div>
          <div className="mt-6">
            <Link to="/admin/reviews" className="text-sm font-medium text-primary hover:underline">
              Moderate reviews →
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="font-semibold">Top cities</h2>
          <ul className="mt-4 space-y-2">
            {stats.topCities.map((c) => {
              const max = stats.topCities[0]?.count ?? 1;
              const pct = (c.count / max) * 100;
              return (
                <li key={c.city}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{c.city}</span>
                    <span className="text-muted-foreground">{c.count}</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-gradient-hero" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
