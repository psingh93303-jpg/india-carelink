import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2, Search, Star } from "lucide-react";
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
import { CITIES, SPECIALTIES } from "@/data/hospitals";

export const Route = createFileRoute("/admin/hospitals")({
  head: () => ({ meta: [{ title: "Hospitals — Admin · MediFinder" }] }),
  component: AdminHospitals,
});

type Row = {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  rating: number;
  featured: boolean;
  emergency: boolean;
};

type FormState = {
  id?: string;
  name: string;
  name_hi: string;
  city: string;
  address: string;
  phone: string;
  lat: string;
  lng: string;
  specialties: string[];
  open_24_7: boolean;
  emergency: boolean;
  icu: boolean;
  ambulance: boolean;
  rating: string;
  about: string;
  image: string;
  featured: boolean;
};

const empty: FormState = {
  name: "", name_hi: "", city: CITIES[0], address: "", phone: "+91", lat: "", lng: "",
  specialties: [], open_24_7: false, emergency: false, icu: false, ambulance: false,
  rating: "4.0", about: "", image: "", featured: false,
};

const schema = z.object({
  name: z.string().trim().min(1).max(200),
  city: z.string().min(1),
  address: z.string().trim().min(1).max(500),
  phone: z.string().trim().min(5).max(30),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  rating: z.number().min(0).max(5),
});

function AdminHospitals() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);
  const [delId, setDelId] = useState<string | null>(null);

  const load = async () => {
    const { data, error } = await supabase
      .from("hospitals")
      .select("id,name,city,address,phone,rating,featured,emergency")
      .order("name");
    if (error) return toast.error(error.message);
    setRows(data as Row[]);
  };

  useEffect(() => { load(); }, []);

  const startNew = () => { setForm(empty); setOpen(true); };
  const startEdit = async (id: string) => {
    const { data, error } = await supabase.from("hospitals").select("*").eq("id", id).single();
    if (error) return toast.error(error.message);
    setForm({
      id: data.id, name: data.name, name_hi: data.name_hi ?? "", city: data.city,
      address: data.address, phone: data.phone, lat: String(data.lat), lng: String(data.lng),
      specialties: data.specialties ?? [], open_24_7: data.open_24_7, emergency: data.emergency,
      icu: data.icu, ambulance: data.ambulance, rating: String(data.rating),
      about: data.about ?? "", image: data.image ?? "", featured: data.featured,
    });
    setOpen(true);
  };

  const save = async () => {
    const parsed = schema.safeParse({
      name: form.name, city: form.city, address: form.address, phone: form.phone,
      lat: parseFloat(form.lat), lng: parseFloat(form.lng), rating: parseFloat(form.rating),
    });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);

    setSaving(true);
    const payload = {
      name: form.name.trim(),
      name_hi: form.name_hi.trim() || null,
      city: form.city,
      address: form.address.trim(),
      phone: form.phone.trim(),
      lat: parsed.data.lat,
      lng: parsed.data.lng,
      specialties: form.specialties,
      open_24_7: form.open_24_7,
      emergency: form.emergency,
      icu: form.icu,
      ambulance: form.ambulance,
      rating: parsed.data.rating,
      about: form.about.trim(),
      image: form.image.trim(),
      featured: form.featured,
    };
    const op = form.id
      ? supabase.from("hospitals").update(payload).eq("id", form.id)
      : supabase.from("hospitals").insert(payload);
    const { error } = await op;
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(form.id ? "Hospital updated" : "Hospital added");
    setOpen(false);
    load();
  };

  const confirmDelete = async () => {
    if (!delId) return;
    const { error } = await supabase.from("hospitals").delete().eq("id", delId);
    if (error) return toast.error(error.message);
    toast.success("Hospital deleted");
    setDelId(null);
    load();
  };

  const filtered = rows?.filter((r) => {
    const s = q.trim().toLowerCase();
    return !s || r.name.toLowerCase().includes(s) || r.city.toLowerCase().includes(s);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hospitals</h1>
          <p className="mt-1 text-sm text-muted-foreground">Add, edit and remove hospitals.</p>
        </div>
        <Button onClick={startNew}><Plus className="h-4 w-4" /> Add hospital</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or city…" className="pl-9" />
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
        {!rows ? (
          <div className="flex h-40 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : filtered && filtered.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">No hospitals found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left p-3 font-medium">Name</th>
                  <th className="text-left p-3 font-medium">City</th>
                  <th className="text-left p-3 font-medium">Phone</th>
                  <th className="text-left p-3 font-medium">Rating</th>
                  <th className="text-left p-3 font-medium">Flags</th>
                  <th className="text-right p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered?.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/30">
                    <td className="p-3 font-medium">{r.name}</td>
                    <td className="p-3 text-muted-foreground">{r.city}</td>
                    <td className="p-3 text-muted-foreground">{r.phone}</td>
                    <td className="p-3"><span className="inline-flex items-center gap-1"><Star className="h-3 w-3 fill-warning text-warning" />{Number(r.rating).toFixed(1)}</span></td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {r.featured && <span className="rounded bg-warning/15 px-1.5 py-0.5 text-xs">Featured</span>}
                        {r.emergency && <span className="rounded bg-emergency/10 text-emergency px-1.5 py-0.5 text-xs">ER</span>}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => startEdit(r.id)}><Pencil className="h-4 w-4" /></Button>
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
          <DialogHeader><DialogTitle>{form.id ? "Edit hospital" : "Add hospital"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={200} /></div>
            <div><Label>Name (Hindi)</Label><Input value={form.name_hi} onChange={(e) => setForm({ ...form, name_hi: e.target.value })} maxLength={200} /></div>
            <div>
              <Label>City</Label>
              <select className="mt-1.5 w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2"><Label>Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} maxLength={500} /></div>
            <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={30} /></div>
            <div><Label>Rating (0–5)</Label><Input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} /></div>
            <div><Label>Latitude</Label><Input type="number" step="0.0001" value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} /></div>
            <div><Label>Longitude</Label><Input type="number" step="0.0001" value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} /></div>
            <div className="sm:col-span-2"><Label>Image URL</Label><Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} /></div>
            <div className="sm:col-span-2"><Label>About</Label><Textarea rows={3} value={form.about} onChange={(e) => setForm({ ...form, about: e.target.value })} maxLength={1000} /></div>
            <div className="sm:col-span-2">
              <Label>Specialties</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {SPECIALTIES.map((s) => {
                  const on = form.specialties.includes(s);
                  return (
                    <button type="button" key={s} onClick={() => setForm({ ...form, specialties: on ? form.specialties.filter((x) => x !== s) : [...form.specialties, s] })} className={`rounded-full border px-3 py-1 text-xs ${on ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:bg-secondary"}`}>{s}</button>
                  );
                })}
              </div>
            </div>
            <div className="sm:col-span-2 grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
              {([
                ["open_24_7", "24/7"], ["emergency", "Emergency"], ["icu", "ICU"], ["ambulance", "Ambulance"], ["featured", "Featured"],
              ] as const).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between gap-2 rounded-lg border border-border p-2">
                  <Label className="text-sm font-normal">{label}</Label>
                  <Switch checked={form[key] as boolean} onCheckedChange={(v) => setForm({ ...form, [key]: v })} />
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin" />} Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!delId} onOpenChange={(o) => !o && setDelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete this hospital?</AlertDialogTitle><AlertDialogDescription>This permanently removes the hospital and all of its reviews.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
