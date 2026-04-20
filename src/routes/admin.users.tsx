import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Shield, ShieldOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "Users — Admin · MediFinder" }] }),
  component: AdminUsers,
});

type UserRow = {
  user_id: string;
  display_name: string | null;
  created_at: string;
  isAdmin: boolean;
};

function AdminUsers() {
  const { user } = useAuth();
  const [rows, setRows] = useState<UserRow[] | null>(null);

  const load = async () => {
    setRows(null);
    const [{ data: profs, error }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("user_id,display_name,created_at").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id,role").eq("role", "admin"),
    ]);
    if (error) return toast.error(error.message);
    const adminSet = new Set((roles ?? []).map((r) => r.user_id));
    setRows((profs ?? []).map((p) => ({
      user_id: p.user_id,
      display_name: p.display_name,
      created_at: p.created_at,
      isAdmin: adminSet.has(p.user_id),
    })));
  };

  useEffect(() => { load(); }, []);

  const toggleAdmin = async (userId: string, makeAdmin: boolean) => {
    if (makeAdmin) {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });
      if (error) return toast.error(error.message);
      toast.success("Granted admin role");
    } else {
      if (userId === user?.id) return toast.error("You can't remove your own admin role.");
      const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "admin");
      if (error) return toast.error(error.message);
      toast.success("Removed admin role");
    }
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage user accounts and admin access.</p>
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
                  <th className="text-left p-3 font-medium">Role</th>
                  <th className="text-right p-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((r) => (
                  <tr key={r.user_id} className="hover:bg-muted/30">
                    <td className="p-3 font-medium">{r.display_name ?? "—"}</td>
                    <td className="p-3 text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="p-3">
                      {r.isAdmin
                        ? <span className="inline-flex items-center gap-1 rounded bg-primary/10 text-primary px-2 py-0.5 text-xs font-semibold"><Shield className="h-3 w-3" /> Admin</span>
                        : <span className="text-xs text-muted-foreground">User</span>}
                    </td>
                    <td className="p-3 text-right">
                      {r.isAdmin ? (
                        <Button size="sm" variant="outline" onClick={() => toggleAdmin(r.user_id, false)} disabled={r.user_id === user?.id}>
                          <ShieldOff className="h-4 w-4" /> Revoke admin
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => toggleAdmin(r.user_id, true)}>
                          <Shield className="h-4 w-4" /> Make admin
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Note: the first registered user must be promoted to admin via the database. Once one admin exists, that admin can promote others here.
      </p>
    </div>
  );
}
