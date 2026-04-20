import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, X, Star, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/reviews")({
  head: () => ({ meta: [{ title: "Reviews — Admin · MediFinder" }] }),
  component: AdminReviews,
});

type ReviewRow = {
  id: string;
  rating: number;
  comment: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  hospital_id: string;
  user_id: string;
  hospitals: { name: string; city: string } | null;
  profiles: { display_name: string | null } | null;
};

const TABS = ["pending", "approved", "rejected"] as const;

function AdminReviews() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("pending");
  const [rows, setRows] = useState<ReviewRow[] | null>(null);

  const load = async () => {
    setRows(null);
    const { data, error } = await supabase
      .from("reviews")
      .select("id,rating,comment,status,created_at,hospital_id,user_id,hospitals(name,city)")
      .eq("status", tab)
      .order("created_at", { ascending: false });
    if (error) return toast.error(error.message);
    // Fetch profiles separately (no FK relationship configured for embed)
    const userIds = [...new Set((data ?? []).map((r) => r.user_id))];
    let profilesById = new Map<string, string | null>();
    if (userIds.length) {
      const { data: profs } = await supabase.from("profiles").select("user_id,display_name").in("user_id", userIds);
      profilesById = new Map((profs ?? []).map((p) => [p.user_id, p.display_name]));
    }
    setRows(((data ?? []) as unknown as ReviewRow[]).map((r) => ({ ...r, profiles: { display_name: profilesById.get(r.user_id) ?? null } })));
  };

  useEffect(() => { load(); }, [tab]);

  const setStatus = async (id: string, status: "approved" | "rejected") => {
    const { error } = await supabase.from("reviews").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Review ${status}`);
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Review deleted");
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reviews</h1>
        <p className="mt-1 text-sm text-muted-foreground">Approve, reject or delete user-submitted reviews.</p>
      </div>

      <div className="inline-flex rounded-lg border border-border bg-card p-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md capitalize ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {!rows ? (
        <div className="flex h-40 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          No {tab} reviews.
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{r.hospitals?.name ?? "Unknown hospital"}</div>
                  <div className="text-xs text-muted-foreground">
                    {r.hospitals?.city} · by {r.profiles?.display_name ?? "anonymous"} · {new Date(r.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="inline-flex items-center gap-1 rounded-md bg-warning/15 px-2 py-1 text-sm font-semibold">
                  <Star className="h-3.5 w-3.5 fill-warning text-warning" /> {r.rating}
                </div>
              </div>
              <p className="mt-3 text-sm whitespace-pre-wrap">{r.comment}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {tab !== "approved" && (
                  <Button size="sm" onClick={() => setStatus(r.id, "approved")}><Check className="h-4 w-4" /> Approve</Button>
                )}
                {tab !== "rejected" && (
                  <Button size="sm" variant="outline" onClick={() => setStatus(r.id, "rejected")}><X className="h-4 w-4" /> Reject</Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => remove(r.id)} className="text-destructive">
                  <Trash2 className="h-4 w-4" /> Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
