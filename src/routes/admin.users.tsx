import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Shield, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth, ROLE_LABELS, type AppRole } from "@/lib/auth";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "Users — Admin · CareLink India" }] }),
  component: AdminUsers,
});

const ASSIGNABLE_ROLES: AppRole[] = ["admin", "manager", "hospital_manager", "financial_manager"];

type UserRow = {
  user_id: string;
  email: string | null;
  display_name: string | null;
  username: string | null;
  phone: string | null;
  created_at: string;
  roles: Set<AppRole>;
};

function AdminUsers() {
  const { user } = useAuth();
  const [rows, setRows] = useState<UserRow[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const load = async () => {
    setRows(null);
    const { data, error } = await supabase.rpc("admin_list_users");
    if (error) {
      toast.error(error.message);
      setRows([]);
      return;
    }
    setRows(
      (data ?? []).map((r) => ({
        user_id: r.user_id,
        email: r.email,
        display_name: r.display_name,
        username: r.username,
        phone: r.phone,
        created_at: r.created_at,
        roles: new Set((r.roles ?? []).filter((x): x is AppRole => x !== "user") as AppRole[]),
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

  const filtered = useMemo(() => {
    if (!rows) return null;
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.email, r.display_name, r.username, r.phone].some((v) => v?.toLowerCase().includes(q)),
    );
  }, [rows, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="mt-1 text-sm text-muted-foreground">{rows ? `${rows.length} registered users` : "Loading…"}</p>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, phone…"
            className="pl-9"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
        {!filtered ? (
          <div className="flex h-40 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">No users match.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left p-3 font-medium">User</th>
                  <th className="text-left p-3 font-medium">Contact</th>
                  <th className="text-left p-3 font-medium">Joined</th>
                  {ASSIGNABLE_ROLES.map((r) => (
                    <th key={r} className="text-left p-3 font-medium whitespace-nowrap">{ROLE_LABELS[r]}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((r) => (
                  <tr key={r.user_id} className="hover:bg-muted/30">
                    <td className="p-3">
                      <div className="font-medium flex items-center gap-2">
                        {r.display_name ?? "—"}
                        {r.user_id === user?.id && <span className="text-xs text-muted-foreground">(you)</span>}
                      </div>
                      {r.username && <div className="text-xs text-muted-foreground">@{r.username}</div>}
                    </td>
                    <td className="p-3">
                      <div className="text-xs">{r.email ?? "—"}</div>
                      {r.phone && <div className="text-xs text-muted-foreground">{r.phone}</div>}
                    </td>
                    <td className="p-3 text-muted-foreground whitespace-nowrap">{new Date(r.created_at).toLocaleDateString()}</td>
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
