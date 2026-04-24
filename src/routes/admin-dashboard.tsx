import { createFileRoute } from "@tanstack/react-router";
import { Building2, CheckCircle2, FileText, ShieldCheck, Users } from "lucide-react";
import { RoleDashboard } from "@/components/RoleDashboard";
import { requireDashboardRole } from "@/lib/dashboard-access";

export const Route = createFileRoute("/admin-dashboard")({
  beforeLoad: ({ location }) => requireDashboardRole(location.pathname, ["admin"]),
  head: () => ({ meta: [{ title: "Admin Dashboard — CareLink India" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  return (
    <RoleDashboard
      badge="Admin Portal"
      title="Admin Dashboard"
      subtitle="Full control for users, verification, approvals, pages, listings and platform settings."
      metrics={[
        { label: "Control level", value: "Full", icon: ShieldCheck },
        { label: "Approvals", value: "All", icon: CheckCircle2 },
        { label: "Users", value: "Managed", icon: Users },
        { label: "Pages", value: "CMS", icon: FileText },
      ]}
      actions={[
        { label: "Manage users", to: "/admin/users", icon: Users },
        { label: "Verify hospitals", to: "/admin/hospitals", icon: Building2 },
        { label: "Site settings", to: "/admin/site", icon: FileText },
      ]}
    />
  );
}