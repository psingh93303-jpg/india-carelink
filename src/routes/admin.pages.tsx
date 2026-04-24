import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { FileText, Plus, Save, Trash2 } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { RichTextEditor } from "@/components/RichTextEditor";
import type { AppRole } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/auth";

type CmsPage = {
  id: string;
  title: string;
  slug: string;
  content: Record<string, unknown>;
  role_access: AppRole[];
  status: "draft" | "published";
};

const pageSchema = z.object({
  title: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens"),
});

const editableRoles: AppRole[] = ["admin", "manager", "financial_manager", "hospital_manager", "human_resource_manager"];

export const Route = createFileRoute("/admin/pages")({
  head: () => ({ meta: [{ title: "Manage Pages — CareLink India" }] }),
  component: AdminPages,
});

function AdminPages() {
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const active = useMemo(() => pages.find((page) => page.id === activeId) ?? pages[0], [activeId, pages]);

  const load = async () => {
    const { data, error } = await (supabase as any).from("cms_pages").select("*").order("updated_at", { ascending: false });
    if (error) return toast.error(error.message);
    setPages((data ?? []) as CmsPage[]);
    if (!activeId && data?.[0]) setActiveId(data[0].id);
  };

  useEffect(() => { load(); }, []);

  const updateActive = (patch: Partial<CmsPage>) => {
    if (!active) return;
    setPages((current) => current.map((page) => page.id === active.id ? { ...page, ...patch } : page));
  };

  const createPage = () => {
    const id = crypto.randomUUID();
    const page: CmsPage = { id, title: "New Page", slug: `new-page-${pages.length + 1}`, content: {}, role_access: [], status: "draft" };
    setPages([page, ...pages]);
    setActiveId(id);
  };

  const savePage = async () => {
    if (!active) return;
    const parsed = pageSchema.safeParse({ title: active.title, slug: active.slug });
    if (!parsed.success) return toast.error(parsed.error.issues[0]?.message ?? "Invalid page");
    setSaving(true);
    const payload = {
      title: parsed.data.title,
      slug: parsed.data.slug,
      content: active.content,
      role_access: active.role_access,
      status: active.status,
      published_at: active.status === "published" ? new Date().toISOString() : null,
    };
    const { error } = await (supabase as any).from("cms_pages").upsert({ id: active.id, ...payload }, { onConflict: "id" });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Page saved");
    load();
  };

  const deletePage = async () => {
    if (!active) return;
    const { error } = await (supabase as any).from("cms_pages").delete().eq("id", active.id);
    if (error) return toast.error(error.message);
    toast.success("Page deleted");
    setPages((current) => current.filter((page) => page.id !== active.id));
    setActiveId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Pages</h1>
          <p className="mt-1 text-sm text-muted-foreground">Create CMS pages and control who can view them.</p>
        </div>
        <Button onClick={createPage}><Plus className="h-4 w-4" /> New page</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-2xl border border-border bg-card p-3 shadow-soft">
          {pages.length === 0 ? <p className="p-3 text-sm text-muted-foreground">No pages yet.</p> : pages.map((page) => (
            <button key={page.id} onClick={() => setActiveId(page.id)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-secondary">
              <FileText className="h-4 w-4 text-primary" />
              <span className="min-w-0 flex-1 truncate">{page.title}</span>
            </button>
          ))}
        </aside>

        {active && (
          <section className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Title"><Input value={active.title} onChange={(e) => updateActive({ title: e.target.value })} /></Field>
              <Field label="Slug"><Input value={active.slug} onChange={(e) => updateActive({ slug: e.target.value })} /></Field>
            </div>
            <Field label="Content"><RichTextEditor value={active.content} onChange={(content) => updateActive({ content })} /></Field>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-border p-4">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Role access</Label>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {editableRoles.map((role) => (
                    <label key={role} className="flex items-center gap-2 text-sm">
                      <Checkbox checked={active.role_access.includes(role)} onCheckedChange={(checked) => updateActive({ role_access: checked ? [...active.role_access, role] : active.role_access.filter((r) => r !== role) })} />
                      {ROLE_LABELS[role]}
                    </label>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-border p-4">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Publish status</Label>
                <div className="mt-3 flex items-center gap-3">
                  <Switch checked={active.status === "published"} onCheckedChange={(checked) => updateActive({ status: checked ? "published" : "draft" })} />
                  <span className="text-sm font-medium">{active.status === "published" ? "Published" : "Draft"}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
              <Button variant="outline" onClick={deletePage}><Trash2 className="h-4 w-4" /> Delete</Button>
              <Button onClick={savePage} disabled={saving} variant="hero"><Save className="h-4 w-4" /> {saving ? "Saving…" : "Save page"}</Button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label><div className="mt-1">{children}</div></div>;
}