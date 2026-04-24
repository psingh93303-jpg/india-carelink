import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useRef, useState, type FormEvent } from "react";
import { FileUp, Loader2, ShieldCheck } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

const schema = z.object({
  entityType: z.enum(["hospital", "lab"]),
  entityName: z.string().trim().min(2).max(200),
  basicInfo: z.string().trim().min(10).max(2000),
});

export const Route = createFileRoute("/verification-request")({
  beforeLoad: async ({ location }) => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/auth", search: { redirect: location.pathname } });
  },
  head: () => ({ meta: [{ title: "Request Verification — CareLink India" }] }),
  component: VerificationRequestPage,
});

function VerificationRequestPage() {
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [entityType, setEntityType] = useState<"hospital" | "lab">("hospital");
  const [entityName, setEntityName] = useState("");
  const [basicInfo, setBasicInfo] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user) return;
    const parsed = schema.safeParse({ entityType, entityName, basicInfo });
    if (!parsed.success) return toast.error(parsed.error.issues[0]?.message ?? "Invalid request");
    if (files.length === 0) return toast.error("Upload at least one document");
    setLoading(true);
    const paths: string[] = [];
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        setLoading(false);
        return toast.error("Each document must be under 10 MB");
      }
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "pdf";
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("verification-documents").upload(path, file, { contentType: file.type, upsert: false });
      if (error) {
        setLoading(false);
        return toast.error(error.message);
      }
      paths.push(path);
    }
    const { error } = await (supabase as any).from("verification_requests").insert({
      user_id: user.id,
      entity_type: parsed.data.entityType,
      entity_name: parsed.data.entityName,
      basic_info: parsed.data.basicInfo,
      document_paths: paths,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Verification request submitted");
    setEntityName("");
    setBasicInfo("");
    setFiles([]);
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <div className="mb-6">
        <p className="text-sm font-medium text-primary">CareLink verification</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Submit verification request</h1>
        <p className="mt-2 text-sm text-muted-foreground">Upload documents and basic information for hospital or lab verification.</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <Field label="Type">
          <Select value={entityType} onValueChange={(value) => setEntityType(value as "hospital" | "lab")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="hospital">Hospital</SelectItem><SelectItem value="lab">Pathology Lab</SelectItem></SelectContent>
          </Select>
        </Field>
        <Field label="Name"><Input value={entityName} onChange={(e) => setEntityName(e.target.value)} required maxLength={200} /></Field>
        <Field label="Basic info"><Textarea value={basicInfo} onChange={(e) => setBasicInfo(e.target.value)} rows={6} required maxLength={2000} /></Field>
        <Field label="Documents">
          <input ref={fileRef} type="file" multiple className="hidden" onChange={(e) => setFiles(Array.from(e.target.files ?? []).slice(0, 5))} />
          <Button type="button" variant="outline" onClick={() => fileRef.current?.click()}><FileUp className="h-4 w-4" /> Choose documents</Button>
          <div className="mt-2 text-xs text-muted-foreground">{files.length ? files.map((file) => file.name).join(", ") : "PDF or image documents, max 5 files."}</div>
        </Field>
        <div className="flex justify-between gap-3 border-t border-border pt-4">
          <Button asChild variant="outline"><Link to="/"><ShieldCheck className="h-4 w-4" /> Back</Link></Button>
          <Button type="submit" disabled={loading} variant="hero">{loading && <Loader2 className="h-4 w-4 animate-spin" />} Submit request</Button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label><div className="mt-1">{children}</div></div>;
}