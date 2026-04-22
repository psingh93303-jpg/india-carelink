import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Pencil, Trash2, Loader2, Search, Upload, X, Crosshair } from "lucide-react";
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
import { CITIES } from "@/data/hospitals";
import { LocationPicker } from "@/components/LocationPicker";

export const Route = createFileRoute("/admin/labs")({
  head: () => ({ meta: [{ title: "Pathology Labs — Admin · CareLink India" }] }),
  component: AdminLabs,
});

type Row = { id: string; name: string; city: string; phone: string; rating: number; featured: boolean };

type Form = {
  id?: string;
  name: string;
  name_hi: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  lat: string;
  lng: string;
  tests: string[];
  open_24_7: boolean;
  home_collection: boolean;
  accreditation: string;
  about: string;
  image: string;
  rating: string;
  featured: boolean;
};

const empty: Form = {
  name: "", name_hi: "", city: CITIES[0], address: "", phone: "+91", email: "",
  lat: "", lng: "", tests: [], open_24_7: false, home_collection: false,
  accreditation: "", about: "", image: "", rating: "0", featured: false,
};

const schema = z.object({
  name: z.string().trim().min(2).max(200),
  city: z.string().min(1),
  address: z.string().trim().min(5).max(500),
  phone: z.string().trim().max(30).regex(/^[+\d][\d\s\-()]*$/, "Invalid phone").or(z.literal("")),
  email: z.string().trim().email().or(z.literal("")),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  rating: z.number().min(0).max(5),
});

function AdminLabs() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(empty);
  const [saving, setSaving] = useState(false);
  const [delId, setDelId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [testInput, setTestInput] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const { data, error } = await supabase
      .from("pathology_labs")
      .select("id,name,city,phone,rating,featured")
      .order("name");
    if (error) return toast.error(error.message);
    setRows(data as Row[]);
  };

  useEffect(() => { load(); }, []);

  const startNew = () => { setForm(empty); setTestInput(""); setOpen(true); };
  const startEdit = async (id: string) => {
    const { data, error } = await supabase.from("pathology_labs").select("*").eq("id", id).single();
    if (error) return toast.error(error.message);
    setForm({
      id: data.id, name: data.name, name_hi: data.name_hi ?? "", city: data.city,
      address: data.address, phone: data.phone, email: data.email,
      lat: String(data.lat), lng: String(data.lng), tests: data.tests ?? [],
      open_24_7: data.open_24_7, home_collection: data.home_collection,
      accreditation: data.accreditation, about: data.about, image: data.image,
      rating: String(data.rating), featured: data.featured,
    });
    setTestInput("");
    setOpen(true);
  };

  const useMyLoc = () => {
    if (!("geolocation" in navigator)) return toast.error("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(
      (p) => setForm((f) => ({ ...f, lat: p.coords.latitude.toFixed(6), lng: p.coords.longitude.toFixed(6) })),
      () => toast.error("Could not get location"),
    );
  };

  const onUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) return toast.error("Pick an image");
    if (file.size > 5 * 1024 * 1024) return toast.error("Max 5 MB");
    setUploading(true);
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `labs/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("hospital-images").upload(path, file, { contentType: file.type });
    setUploading(false);
    if (error) return toast.error(error.message);
    const { data } = supabase.storage.from("hospital-images").getPublicUrl(path);
    setForm((f) => ({ ...f, image: data.publicUrl }));
    toast.success("Uploaded");
  };

  const addTest = () => {
    const v = testInput.trim();
    if (!v || form.tests.includes(v)) return;
    setForm({ ...form, tests: [...form.tests, v] });
    setTestInput("");
  };

  const save = async () => {
    const parsed = schema.safeParse({
      name: form.name, city: form.city, address: form.address,
      phone: form.phone, email: form.email,
      lat: form.lat === "" ? Number.NaN : parseFloat(form.lat),
      lng: form.lng === "" ? Number.NaN : parseFloat(form.lng),
      rating: parseFloat(form.rating || "0"),
    });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setSaving(true);
    const payload = {
      name: parsed.data.name,
      name_hi: form.name_hi.trim() || null,
      city: parsed.data.city,
      address: parsed.data.address,
      phone: form.phone.trim(),
      email: form.email.trim(),
      lat: parsed.data.lat,
      lng: parsed.data.lng,
      tests: form.tests,
      open_24_7: form.open_24_7,
      home_collection: form.home_collection,
      accreditation: form.accreditation.trim(),
      about: form.about.trim(),
      image: form.image.trim(),
      rating: parsed.data.rating,
      featured: form.featured,
    };
    const op = form.id
      ? supabase.from("pathology_labs").update(payload).eq("id", form.id)
      : supabase.from("pathology_labs").insert(payload);
    const { error } = await op;
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(form.id ? "Lab updated" : "Lab added");
    setOpen(false);
    load();
  };

  const confirmDelete = async () => {
    if (!delId) return;
    const { error } = await supabase.from("pathology_labs").delete().eq("id", delId);
    if (error) return toast.error(error.message);
    toast.success("Lab deleted");
    setDelId(null);
    load();
  };

  const filtered = rows?.filter((r) => {
    const s = q.trim().toLowerCase();
    return !s || r.name.toLowerCase().includes(s) || r.city.toLowerCase().includes(s);
  });

  const latNum = form.lat === "" ? null : Number(form.lat);
  const lngNum = form.lng === "" ? null : Number(form.lng);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pathology Labs</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage diagnostic labs shown in the public directory.</p>
        </div>
        <Button onClick={startNew}><Plus className="h-4 w-4" /> Add lab</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or city…" className="pl-9" />
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
        {!rows ? (
          <div className="flex h-40 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : filtered && filtered.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">No labs yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left p-3 font-medium">Name</th>
                  <th className="text-left p-3 font-medium">City</th>
                  <th className="text-left p-3 font-medium">Phone</th>
                  <th className="text-left p-3 font-medium">Rating</th>
                  <th className="text-right p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered?.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/30">
                    <td className="p-3 font-medium">{r.name} {r.featured && <span className="ml-1 rounded bg-warning/15 px-1.5 py-0.5 text-xs">★</span>}</td>
                    <td className="p-3 text-muted-foreground">{r.city}</td>
                    <td className="p-3 text-muted-foreground">{r.phone}</td>
                    <td className="p-3">{Number(r.rating).toFixed(1)}</td>
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{form.id ? "Edit lab" : "Add lab"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Name (Hindi)</Label><Input value={form.name_hi} onChange={(e) => setForm({ ...form, name_hi: e.target.value })} /></div>
            <div>
              <Label>City</Label>
              <select className="mt-1.5 w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2"><Label>Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
            <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div><Label>Accreditation (e.g. NABL)</Label><Input value={form.accreditation} onChange={(e) => setForm({ ...form, accreditation: e.target.value })} /></div>
            <div><Label>Rating (0–5)</Label><Input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} /></div>

            <div className="sm:col-span-2">
              <Label>Image</Label>
              <div className="mt-1.5 flex flex-wrap items-start gap-3">
                <div className="h-24 w-32 overflow-hidden rounded-lg border border-border bg-muted flex items-center justify-center text-xs text-muted-foreground">
                  {form.image ? <img src={form.image} alt="preview" className="h-full w-full object-cover" /> : "No image"}
                </div>
                <div className="flex-1 min-w-[200px] space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <input ref={fileRef} type="file" accept="image/*" className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); e.target.value = ""; }} />
                    <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                      {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload
                    </Button>
                    {form.image && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => setForm({ ...form, image: "" })}>
                        <X className="h-4 w-4" /> Remove
                      </Button>
                    )}
                  </div>
                  <Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="…or paste an image URL" />
                </div>
              </div>
            </div>

            <div className="sm:col-span-2"><Label>About</Label><Textarea rows={3} value={form.about} onChange={(e) => setForm({ ...form, about: e.target.value })} /></div>

            <div className="sm:col-span-2">
              <div className="flex items-center justify-between">
                <Label>Location</Label>
                <Button type="button" variant="ghost" size="sm" onClick={useMyLoc}><Crosshair className="h-4 w-4" /> Use my location</Button>
              </div>
              <div className="mt-2">
                <LocationPicker
                  lat={Number.isFinite(latNum as number) ? (latNum as number) : null}
                  lng={Number.isFinite(lngNum as number) ? (lngNum as number) : null}
                  onChange={(lat, lng) => setForm((f) => ({ ...f, lat: lat.toFixed(6), lng: lng.toFixed(6) }))}
                  height={240}
                />
              </div>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Latitude</Label><Input type="number" step="0.000001" value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} /></div>
                <div><Label className="text-xs">Longitude</Label><Input type="number" step="0.000001" value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} /></div>
              </div>
            </div>

            <div className="sm:col-span-2">
              <Label>Tests offered</Label>
              {form.tests.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {form.tests.map((s) => (
                    <span key={s} className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2.5 py-1 text-xs font-medium">
                      {s}
                      <button type="button" onClick={() => setForm({ ...form, tests: form.tests.filter((x) => x !== s) })} className="hover:bg-primary/20 rounded-full p-0.5"><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-2 flex gap-2">
                <Input value={testInput} onChange={(e) => setTestInput(e.target.value)} placeholder="e.g. CBC, Thyroid Panel" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTest(); } }} />
                <Button type="button" variant="outline" onClick={addTest}>Add</Button>
              </div>
            </div>

            <div className="sm:col-span-2 grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between rounded-lg border p-3"><Label>Open 24/7</Label><Switch checked={form.open_24_7} onCheckedChange={(v) => setForm({ ...form, open_24_7: v })} /></div>
              <div className="flex items-center justify-between rounded-lg border p-3"><Label>Home collection</Label><Switch checked={form.home_collection} onCheckedChange={(v) => setForm({ ...form, home_collection: v })} /></div>
              <div className="flex items-center justify-between rounded-lg border p-3 col-span-2"><Label>Featured on listing</Label><Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} /></div>
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
            <AlertDialogTitle>Delete this lab?</AlertDialogTitle>
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
