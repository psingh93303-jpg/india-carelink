import { redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/lib/auth";

export async function requireDashboardRole(locationPathname: string, allowedRoles: AppRole[]) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw redirect({ to: "/auth", search: { redirect: locationPathname } });
  }

  const { data } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id);
  const roles = ((data ?? []).map((row) => row.role)) as AppRole[];

  if (!roles.some((role) => allowedRoles.includes(role))) {
    throw redirect({ to: "/admin/forbidden" });
  }
}