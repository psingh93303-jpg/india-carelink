import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useAuth, ROLE_LABELS, type AppRole } from "@/lib/auth";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "Users — Admin · CareLink India" }] }),
  component: AdminUsers,
});

const ASSIGNABLE_ROLES: AppRole[] = ["admin", "manager", "hospital_manager", "financial_manager"];

type UserRow = {
  user_id: string;
  display_name: string | null;
  created_at: string;
  roles: Set<AppRole>;
};

function AdminUsers() {
  const { user } = useAuth();
  const [rows, setRows] = useState<UserRow[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    setRows(null);
    const [{ data: profs, error }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("user_id,display_name,created_at").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id,role"),
    ]);
    if (error) return toast.error(error.message);
    const map = new Map<string, Set<AppRole>>();
    for (const r of roles ?? []) {
      const set = map.get(r.user_id) ?? new Set<AppRole>();
      set.add(r.role as AppRole);
      map.set(r.user_id, set);
    }
    setRows(
      (profs ?? []).map((p) => ({
        user_id: p.user_id,
        display_name: p.display_name,
        created_at: p.created_at,
        roles: map.get(p.user_id) ?? new Set<AppRole>(),
      })),
    );
  };

  useEffect(() => {
    load();
  }, []);

  const toggleRole = async (userId: string, role: AppRole, grant: boolean) => {
    if (!grant && role === "admin" && userId === user?.id) {
      return toast.error("You can't remove your own admin role.");
    }
    setBusy(`${userId}:${role}`);
    if (grant) {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
      if (error) {
        setBusy(null);
        return toast.error(error.message);
      }
      toast.success(`Granted ${ROLE_LABELS[role]}`);
    } else {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role);
      if (error) {
        setBusy(null);
        return toast.error(error.message);
      }
      toast.success(`Removed ${ROLE_LABELS[role]}`);
    }
    setBusy(null);
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">Assign roles to control admin portal access.</p>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
        {!rows ? (
          <div className="flex h-40 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">No users yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left p-3 font-medium">Name</th>
                  <th className="text-left p-3 font-medium">Joined</th>
                  {ASSIGNABLE_ROLES.map((r) => (
                    <th key={r} className="text-left p-3 font-medium">{ROLE_LABELS[r]}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((r) => (
                  <tr key={r.user_id} className="hover:bg-muted/30">
                    <td className="p-3">
                      <div className="font-medium flex items-center gap-2">
                        {r.display_name ?? "—"}
                        {r.user_id === user?.id && <span className="text-xs text-muted-foreground">(you)</span>}
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
                    {ASSIGNABLE_ROLES.map((role) => {
                      const has = r.roles.has(role);
                      const key = `${r.user_id}:${role}`;
                      const isSelf = role === "admin" && r.user_id === user?.id;
                      return (
                        <td key={role} className="p-3">
                          <Checkbox
                            checked={has}
                            disabled={busy === key || isSelf}
                            onCheckedChange={(v) => toggleRole(r.user_id, role, !!v)}
                            aria-label={`${ROLE_LABELS[role]} for ${r.display_name ?? "user"}`}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-muted/30 p-4 text-xs text-muted-foreground space-y-1">
        <p className="flex items-center gap-1.5 font-medium text-foreground"><Shield className="h-3.5 w-3.5" /> Role permissions</p>
        <p>• <b>Admin</b> — full access including users, site settings and version history.</p>
        <p>• <b>Manager</b> — can edit hospitals, doctors, departments, staff, and moderate reviews.</p>
        <p>• <b>Hospital Manager</b> — can edit hospitals, doctors, departments, staff.</p>
        <p>• <b>Financial Manager</b> — reserved for finance/appointments (future phase).</p>
      </div>
    </div>
  );
}
