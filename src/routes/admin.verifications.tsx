import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, ExternalLink, Loader2, ShieldCheck, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

type RequestRow = {
  id: string;
  user_id: string;
  entity_type: "hospital" | "lab";
  entity_id: string | null;
  entity_name: string;
  basic_info: string;
  document_paths: string[];
  status: "pending" | "approved" | "rejected";
  reviewer_notes: string;
  created_at: string;
};

export const Route = createFileRoute("/admin/verifications")({
  head: () => ({ meta: [{ title: "Verification Requests — CareLink India" }] }),
  component: AdminVerifications,
});

function AdminVerifications() {
  const { user } = useAuth();
  const [rows, setRows] = useState<RequestRow[] | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    const { data, error } = await (supabase as any).from("verification_requests").select("*").order("created_at", { ascending: false });
    if (error) return toast.error(error.message);
    setRows((data ?? []) as RequestRow[]);
  };

  useEffect(() => { load(); }, []);

  const openDocument = async (path: string) => {
    const { data, error } = await supabase.storage.from("verification-documents").createSignedUrl(path, 300);
    if (error) return toast.error(error.message);
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  const review = async (row: RequestRow, status: "approved" | "rejected") => {
    if (!user) return;
    setBusy(row.id);
    const reviewerNotes = notes[row.id] ?? row.reviewer_notes ?? "";
    const { error } = await (supabase as any).from("verification_requests").update({
      status,
      reviewer_notes: reviewerNotes,
      reviewer_id: user.id,
      reviewed_at: new Date().toISOString(),
    }).eq("id", row.id);
    if (!error && status === "approved" && row.entity_id) {
      const table = row.entity_type === "hospital" ? "hospitals" : "pathology_labs";
      await (supabase as any).from(table).update({ is_verified: true, verified_at: new Date().toISOString(), verified_by: user.id }).eq("id", row.entity_id);
    }
    setBusy(null);
    if (error) return toast.error(error.message);
    toast.success(status === "approved" ? "Request approved" : "Request rejected");
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Verification Requests</h1>
        <p className="mt-1 text-sm text-muted-foreground">Review hospital and lab verification submissions.</p>
      </div>

      {!rows ? (
        <div className="flex h-40 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">No requests yet.</div>
      ) : (
        <div className="space-y-4">
          {rows.map((row) => (
            <section key={row.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">{row.entity_name}</h2>
                    <Badge variant={row.status === "pending" ? "secondary" : row.status === "approved" ? "default" : "destructive"}>{row.status}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{row.entity_type === "hospital" ? "Hospital" : "Pathology Lab"} · {new Date(row.created_at).toLocaleString()}</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">{row.basic_info}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {row.document_paths.map((path) => (
                  <Button key={path} type="button" variant="outline" size="sm" onClick={() => openDocument(path)}>
                    <ExternalLink className="h-4 w-4" /> View document
                  </Button>
                ))}
              </div>
              <div className="mt-4">
                <Textarea value={notes[row.id] ?? row.reviewer_notes ?? ""} onChange={(e) => setNotes({ ...notes, [row.id]: e.target.value })} placeholder="Reviewer notes" rows={3} />
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" disabled={busy === row.id} onClick={() => review(row, "rejected")}><XCircle className="h-4 w-4" /> Reject</Button>
                <Button variant="hero" disabled={busy === row.id} onClick={() => review(row, "approved")}><CheckCircle2 className="h-4 w-4" /> Approve</Button>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}