import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Plus, Pencil, Trash2, Loader2, Stethoscope, Building2, Users as UsersIcon } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/cms/$hospitalId")({
  head: () => ({ meta: [{ title: "Hospital CMS — Admin · CareLink India" }] }),
  component: HospitalCMS,
});

type Department = { id: string; name: string; name_hi: string | null; description: string; head_doctor: string; phone: string; display_order: number };
type Doctor = { id: string; name: string; name_hi: string | null; specialty: string; qualification: string; phone: string; email: string; photo_url: string; consultation_hours: string; department_id: string | null; display_order: number };
type Staff = { id: string; name: string; role_title: string; phone: string; email: string; display_order: number };

const deptSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(150),
  name_hi: z.string().trim().max(150).optional(),
  description: z.string().trim().max(1000),
  head_doctor: z.string().trim().max(150),
  phone: z.string().trim().max(30),
  display_order: z.number().int().min(0).max(9999),
});
const doctorSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(150),
  name_hi: z.string().trim().max(150).optional(),
  specialty: z.string().trim().max(150),
  qualification: z.string().trim().max(200),
  phone: z.string().trim().max(30),
  email: z.string().trim().max(150),
  photo_url: z.string().trim().max(500),
  consultation_hours: z.string().trim().max(200),
  display_order: z.number().int().min(0).max(9999),
});
const staffSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(150),
  role_title: z.string().trim().max(150),
  phone: z.string().trim().max(30),
  email: z.string().trim().max(150),
  display_order: z.number().int().min(0).max(9999),
});

function HospitalCMS() {
  const { hospitalId } = Route.useParams();
  const [hospitalName, setHospitalName] = useState<string>("");
  const [departments, setDepartments] = useState<Department[] | null>(null);
  const [doctors, setDoctors] = useState<Doctor[] | null>(null);
  const [staff, setStaff] = useState<Staff[] | null>(null);

  const load = async () => {
    const [h, d, dr, s] = await Promise.all([
      supabase.from("hospitals").select("name").eq("id", hospitalId).maybeSingle(),
      supabase.from("departments").select("*").eq("hospital_id", hospitalId).order("display_order").order("name"),
      supabase.from("doctors").select("*").eq("hospital_id", hospitalId).order("display_order").order("name"),
      supabase.from("hospital_staff").select("*").eq("hospital_id", hospitalId).order("display_order").order("name"),
    ]);
    setHospitalName(h.data?.name ?? "Hospital");
    setDepartments((d.data ?? []) as Department[]);
    setDoctors((dr.data ?? []) as Doctor[]);
    setStaff((s.data ?? []) as Staff[]);
  };
  useEffect(() => { load(); }, [hospitalId]);

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
          <Link to="/admin/hospitals"><ArrowLeft className="h-4 w-4" /> Back to hospitals</Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{hospitalName}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage departments, doctors and staff for this hospital.</p>
      </div>

      <Tabs defaultValue="departments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="departments"><Building2 className="h-4 w-4 mr-1.5" /> Departments</TabsTrigger>
          <TabsTrigger value="doctors"><Stethoscope className="h-4 w-4 mr-1.5" /> Doctors</TabsTrigger>
          <TabsTrigger value="staff"><UsersIcon className="h-4 w-4 mr-1.5" /> Staff</TabsTrigger>
        </TabsList>

        <TabsContent value="departments">
          <DepartmentsPanel hospitalId={hospitalId} items={departments} reload={load} />
        </TabsContent>
        <TabsContent value="doctors">
          <DoctorsPanel hospitalId={hospitalId} items={doctors} departments={departments ?? []} reload={load} />
        </TabsContent>
        <TabsContent value="staff">
          <StaffPanel hospitalId={hospitalId} items={staff} reload={load} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ---------------- Departments ---------------- */
function DepartmentsPanel({ hospitalId, items, reload }: { hospitalId: string; items: Department[] | null; reload: () => void }) {
  const [open, setOpen] = useState(false);
  const [delId, setDelId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Department>({ id: "", name: "", name_hi: "", description: "", head_doctor: "", phone: "", display_order: 0 });

  const startNew = () => { setForm({ id: "", name: "", name_hi: "", description: "", head_doctor: "", phone: "", display_order: 0 }); setOpen(true); };
  const startEdit = (d: Department) => { setForm({ ...d, name_hi: d.name_hi ?? "" }); setOpen(true); };

  const save = async () => {
    const parsed = deptSchema.safeParse({ ...form, display_order: Number(form.display_order) });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setSaving(true);
    const payload = { ...parsed.data, name_hi: form.name_hi?.trim() || null, hospital_id: hospitalId };
    const op = form.id ? supabase.from("departments").update(payload).eq("id", form.id) : supabase.from("departments").insert(payload);
    const { error } = await op;
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(form.id ? "Department updated" : "Department added");
    setOpen(false);
    reload();
  };

  const confirmDelete = async () => {
    if (!delId) return;
    const { error } = await supabase.from("departments").delete().eq("id", delId);
    if (error) return toast.error(error.message);
    toast.success("Department deleted");
    setDelId(null);
    reload();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Button onClick={startNew}><Plus className="h-4 w-4" /> Add department</Button></div>
      <ListShell>
        {!items ? <Loading /> : items.length === 0 ? <Empty label="No departments yet." /> : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr><th className="text-left p-3">Name</th><th className="text-left p-3">Head doctor</th><th className="text-left p-3">Phone</th><th className="text-right p-3">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((d) => (
                <tr key={d.id} className="hover:bg-muted/30">
                  <td className="p-3 font-medium">{d.name}</td>
                  <td className="p-3 text-muted-foreground">{d.head_doctor || "—"}</td>
                  <td className="p-3 text-muted-foreground">{d.phone || "—"}</td>
                  <td className="p-3 text-right">
                    <Button variant="ghost" size="icon" onClick={() => startEdit(d)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setDelId(d.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </ListShell>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{form.id ? "Edit department" : "Add department"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={150} /></div>
            <div className="sm:col-span-2"><Label>Name (Hindi)</Label><Input value={form.name_hi ?? ""} onChange={(e) => setForm({ ...form, name_hi: e.target.value })} maxLength={150} /></div>
            <div><Label>Head doctor</Label><Input value={form.head_doctor} onChange={(e) => setForm({ ...form, head_doctor: e.target.value })} maxLength={150} /></div>
            <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={30} /></div>
            <div className="sm:col-span-2"><Label>Description</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={1000} /></div>
            <div><Label>Display order</Label><Input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} /></div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin" />} Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteDialog open={!!delId} setOpen={(v) => !v && setDelId(null)} onConfirm={confirmDelete} label="department" />
    </div>
  );
}

/* ---------------- Doctors ---------------- */
function DoctorsPanel({ hospitalId, items, departments, reload }: { hospitalId: string; items: Doctor[] | null; departments: Department[]; reload: () => void }) {
  const [open, setOpen] = useState(false);
  const [delId, setDelId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const empty: Doctor = { id: "", name: "", name_hi: "", specialty: "", qualification: "", phone: "", email: "", photo_url: "", consultation_hours: "", department_id: null, display_order: 0 };
  const [form, setForm] = useState<Doctor>(empty);

  const startNew = () => { setForm(empty); setOpen(true); };
  const startEdit = (d: Doctor) => { setForm({ ...d, name_hi: d.name_hi ?? "" }); setOpen(true); };

  const save = async () => {
    const parsed = doctorSchema.safeParse({ ...form, display_order: Number(form.display_order) });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setSaving(true);
    const payload = {
      ...parsed.data,
      name_hi: form.name_hi?.trim() || null,
      department_id: form.department_id || null,
      hospital_id: hospitalId,
    };
    const op = form.id ? supabase.from("doctors").update(payload).eq("id", form.id) : supabase.from("doctors").insert(payload);
    const { error } = await op;
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(form.id ? "Doctor updated" : "Doctor added");
    setOpen(false);
    reload();
  };

  const confirmDelete = async () => {
    if (!delId) return;
    const { error } = await supabase.from("doctors").delete().eq("id", delId);
    if (error) return toast.error(error.message);
    toast.success("Doctor deleted");
    setDelId(null);
    reload();
  };

  const deptName = (id: string | null) => departments.find((d) => d.id === id)?.name ?? "—";

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Button onClick={startNew}><Plus className="h-4 w-4" /> Add doctor</Button></div>
      <ListShell>
        {!items ? <Loading /> : items.length === 0 ? <Empty label="No doctors yet." /> : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr><th className="text-left p-3">Name</th><th className="text-left p-3">Specialty</th><th className="text-left p-3">Department</th><th className="text-left p-3">Phone</th><th className="text-right p-3">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((d) => (
                <tr key={d.id} className="hover:bg-muted/30">
                  <td className="p-3 font-medium">{d.name}</td>
                  <td className="p-3 text-muted-foreground">{d.specialty || "—"}</td>
                  <td className="p-3 text-muted-foreground">{deptName(d.department_id)}</td>
                  <td className="p-3 text-muted-foreground">{d.phone || "—"}</td>
                  <td className="p-3 text-right">
                    <Button variant="ghost" size="icon" onClick={() => startEdit(d)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setDelId(d.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </ListShell>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{form.id ? "Edit doctor" : "Add doctor"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={150} /></div>
            <div><Label>Name (Hindi)</Label><Input value={form.name_hi ?? ""} onChange={(e) => setForm({ ...form, name_hi: e.target.value })} maxLength={150} /></div>
            <div><Label>Specialty</Label><Input value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} maxLength={150} /></div>
            <div><Label>Qualification</Label><Input value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} placeholder="e.g. MBBS, MD" maxLength={200} /></div>
            <div>
              <Label>Department</Label>
              <select className="mt-1.5 w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={form.department_id ?? ""} onChange={(e) => setForm({ ...form, department_id: e.target.value || null })}>
                <option value="">— None —</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div><Label>Display order</Label><Input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} /></div>
            <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={30} /></div>
            <div><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={150} /></div>
            <div className="sm:col-span-2"><Label>Photo URL</Label><Input value={form.photo_url} onChange={(e) => setForm({ ...form, photo_url: e.target.value })} placeholder="https://..." maxLength={500} /></div>
            <div className="sm:col-span-2"><Label>Consultation hours</Label><Input value={form.consultation_hours} onChange={(e) => setForm({ ...form, consultation_hours: e.target.value })} placeholder="Mon–Sat, 10:00–14:00" maxLength={200} /></div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin" />} Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteDialog open={!!delId} setOpen={(v) => !v && setDelId(null)} onConfirm={confirmDelete} label="doctor" />
    </div>
  );
}

/* ---------------- Staff ---------------- */
function StaffPanel({ hospitalId, items, reload }: { hospitalId: string; items: Staff[] | null; reload: () => void }) {
  const [open, setOpen] = useState(false);
  const [delId, setDelId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const empty: Staff = { id: "", name: "", role_title: "", phone: "", email: "", display_order: 0 };
  const [form, setForm] = useState<Staff>(empty);

  const startNew = () => { setForm(empty); setOpen(true); };
  const startEdit = (s: Staff) => { setForm(s); setOpen(true); };

  const save = async () => {
    const parsed = staffSchema.safeParse({ ...form, display_order: Number(form.display_order) });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setSaving(true);
    const payload = { ...parsed.data, hospital_id: hospitalId };
    const op = form.id ? supabase.from("hospital_staff").update(payload).eq("id", form.id) : supabase.from("hospital_staff").insert(payload);
    const { error } = await op;
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(form.id ? "Staff updated" : "Staff added");
    setOpen(false);
    reload();
  };

  const confirmDelete = async () => {
    if (!delId) return;
    const { error } = await supabase.from("hospital_staff").delete().eq("id", delId);
    if (error) return toast.error(error.message);
    toast.success("Staff deleted");
    setDelId(null);
    reload();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Button onClick={startNew}><Plus className="h-4 w-4" /> Add staff</Button></div>
      <ListShell>
        {!items ? <Loading /> : items.length === 0 ? <Empty label="No staff yet." /> : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr><th className="text-left p-3">Name</th><th className="text-left p-3">Role</th><th className="text-left p-3">Phone</th><th className="text-left p-3">Email</th><th className="text-right p-3">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((s) => (
                <tr key={s.id} className="hover:bg-muted/30">
                  <td className="p-3 font-medium">{s.name}</td>
                  <td className="p-3 text-muted-foreground">{s.role_title || "—"}</td>
                  <td className="p-3 text-muted-foreground">{s.phone || "—"}</td>
                  <td className="p-3 text-muted-foreground">{s.email || "—"}</td>
                  <td className="p-3 text-right">
                    <Button variant="ghost" size="icon" onClick={() => startEdit(s)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setDelId(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </ListShell>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{form.id ? "Edit staff" : "Add staff"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={150} /></div>
            <div><Label>Role / title</Label><Input value={form.role_title} onChange={(e) => setForm({ ...form, role_title: e.target.value })} placeholder="e.g. Head Nurse" maxLength={150} /></div>
            <div><Label>Display order</Label><Input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} /></div>
            <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={30} /></div>
            <div><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={150} /></div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin" />} Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteDialog open={!!delId} setOpen={(v) => !v && setDelId(null)} onConfirm={confirmDelete} label="staff member" />
    </div>
  );
}

/* ---------------- Helpers ---------------- */
function ListShell({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden overflow-x-auto">{children}</div>;
}
function Loading() { return <div className="flex h-32 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>; }
function Empty({ label }: { label: string }) { return <div className="p-10 text-center text-sm text-muted-foreground">{label}</div>; }

function DeleteDialog({ open, setOpen, onConfirm, label }: { open: boolean; setOpen: (v: boolean) => void; onConfirm: () => void; label: string }) {
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this {label}?</AlertDialogTitle>
          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
