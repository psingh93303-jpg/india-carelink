import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2, ExternalLink } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/links")({
  head: () => ({ meta: [{ title: "Trusted Links — Admin · CareLink India" }] }),
  component: AdminLinks,
});

type Row = {
  id: string;
  title: string;
  title_hi: string | null;
  url: string;
  description: string;
  description_hi: string;
  category: string;
  display_order: number;
  active: boolean;
};

const empty = { title: "", title_hi: "", url: "", description: "", description_hi: "", category: "general", display_order: 0, active: true };
type Form = typeof empty & { id?: string };

const schema = z.object({
  title: z.string().trim().min(2).max(200),
  url: z.string().trim().url(),
  description: z.string().trim().max(500),
  category: z.string().trim().max(50),
  display_order: z.number().int(),
});

function AdminLinks() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(empty);
  const [saving, setSaving] = useState(false);
  const [delId, setDelId] = useState<string | null>(null);

  const load = async () => {
    const { data, error } = await supabase.from("trusted_links").select("*").order("display_order");
    if (error) return toast.error(error.message);
    setRows(data as Row[]);
  };

  useEffect(() => { load(); }, []);

  const startNew = () => { setForm(empty); setOpen(true); };
  const startEdit = (r: Row) => {
    setForm({
      id: r.id, title: r.title, title_hi: r.title_hi ?? "", url: r.url,
      description: r.description, description_hi: r.description_hi,
      category: r.category, display_order: r.display_order, active: r.active,
    });
    setOpen(true);
  };

  const save = async () => {
    const parsed = schema.safeParse({
      title: form.title, url: form.url, description: form.description,
      category: form.category, display_order: Number(form.display_order),
    });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setSaving(true);
    const payload = {
      title: parsed.data.title,
      title_hi: form.title_hi.trim() || null,
      url: parsed.data.url,
      description: parsed.data.description,
      description_hi: form.description_hi.trim(),
      category: parsed.data.category,
      display_order: parsed.data.display_order,
      active: form.active,
    };
    const op = form.id
      ? supabase.from("trusted_links").update(payload).eq("id", form.id)
      : supabase.from("trusted_links").insert(payload);
    const { error } = await op;
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(form.id ? "Link updated" : "Link added");
    setOpen(false);
    load();
  };

  const confirmDelete = async () => {
    if (!delId) return;
    const { error } = await supabase.from("trusted_links").delete().eq("id", delId);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    setDelId(null);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trusted Links</h1>
          <p className="mt-1 text-sm text-muted-foreground">External medical sources shown beneath AI symptom search results.</p>
        </div>
        <Button onClick={startNew}><Plus className="h-4 w-4" /> Add link</Button>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
        {!rows ? (
          <div className="flex h-40 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">No trusted links yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left p-3 font-medium">Order</th>
                  <th className="text-left p-3 font-medium">Title</th>
                  <th className="text-left p-3 font-medium">Category</th>
                  <th className="text-left p-3 font-medium">Active</th>
                  <th className="text-right p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/30">
                    <td className="p-3 text-muted-foreground">{r.display_order}</td>
                    <td className="p-3 font-medium">
                      <a className="inline-flex items-center gap-1 hover:underline" href={r.url} target="_blank" rel="noreferrer">
                        {r.title} <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                    <td className="p-3 text-muted-foreground">{r.category}</td>
                    <td className="p-3">{r.active ? <span className="rounded bg-success/15 text-success px-1.5 py-0.5 text-xs">Active</span> : <span className="rounded bg-muted px-1.5 py-0.5 text-xs">Hidden</span>}</td>
                    <td className="p-3">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => startEdit(r)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setDelId(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{form.id ? "Edit link" : "Add link"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="sm:col-span-2"><Label>Title (Hindi)</Label><Input value={form.title_hi} onChange={(e) => setForm({ ...form, title_hi: e.target.value })} /></div>
            <div className="sm:col-span-2"><Label>URL</Label><Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://…" /></div>
            <div className="sm:col-span-2"><Label>Description</Label><Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="sm:col-span-2"><Label>Description (Hindi)</Label><Textarea rows={2} value={form.description_hi} onChange={(e) => setForm({ ...form, description_hi: e.target.value })} /></div>
            <div><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
            <div><Label>Display order</Label><Input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} /></div>
            <div className="sm:col-span-2 flex items-center justify-between rounded-lg border p-3">
              <Label>Active (visible on site)</Label>
              <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!delId} onOpenChange={(o) => !o && setDelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this link?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
