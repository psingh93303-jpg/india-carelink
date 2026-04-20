import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, Search, Siren, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — MediFinder UP" },
      { name: "description", content: "MediFinder UP helps you find hospitals and emergency care across Uttar Pradesh, fast and reliably." },
      { property: "og:title", content: "About MediFinder UP" },
      { property: "og:description", content: "Helping Uttar Pradesh find the right hospital, fast." },
    ],
  }),
  component: About,
});

function About() {
  const features = [
    { icon: Search, title: "Smart search", desc: "Filter by city, specialty, ICU, ambulance and 24/7 availability." },
    { icon: Siren, title: "Emergency mode", desc: "One-tap to find the nearest hospital with emergency services." },
    { icon: Globe, title: "Bilingual", desc: "Available in English and हिंदी for everyone in UP." },
    { icon: ShieldCheck, title: "Verified profiles", desc: "Hospital details, contact and location you can rely on." },
  ];
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight">About MediFinder UP</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        MediFinder UP is a healthcare discovery platform designed for Uttar Pradesh. Our mission is to help patients
        and families find the right hospital, clinic or emergency service — quickly, reliably and in the language they speak.
      </p>

      <div className="mt-10 grid sm:grid-cols-2 gap-5">
        {features.map((f) => (
          <div key={f.title} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-hero text-primary-foreground shadow-soft">
              <f.icon className="h-5 w-5" />
            </span>
            <h3 className="mt-3 font-semibold">{f.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{f.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-2xl border border-border bg-secondary/40 p-6">
        <h2 className="font-semibold">Roadmap</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground list-disc pl-5">
          <li>User accounts, save favourites and submit ratings</li>
          <li>Verified hospital partner program & featured listings</li>
          <li>Real-time bed & ambulance availability via partner APIs</li>
          <li>Expansion to all Indian states</li>
        </ul>
      </div>

      <div className="mt-10 text-center">
        <Button asChild variant="hero" size="lg"><Link to="/search" search={{ q: "", city: "", specialty: "", emergency: false, icu: false, ambulance: false, open24_7: false, minRating: 0 }}>Start searching</Link></Button>
      </div>
    </div>
  );
}
