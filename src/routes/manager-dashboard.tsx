import { createFileRoute } from "@tanstack/react-router";
import { Building2, ClipboardCheck, FileText, FlaskConical, MessageSquare } from "lucide-react";
import { RoleDashboard } from "@/components/RoleDashboard";
import { requireDashboardRole } from "@/lib/dashboard-access";

export const Route = createFileRoute("/manager-dashboard")({
  beforeLoad: ({ location }) => requireDashboardRole(location.pathname, ["admin", "manager"]),
  head: () => ({ meta: [{ title: "Manager Dashboard — CareLink India" }] }),
  component: ManagerDashboard,
});

function ManagerDashboard() {
  return (
    <RoleDashboard
      badge="Manager Portal"
      title="Manager Dashboard"
      subtitle="Moderate listings, review content quality, manage public pages and coordinate approvals."
      metrics={[
        { label: "Listings", value: "Moderation", icon: Building2 },
        { label: "Labs", value: "Review", icon: FlaskConical },
        { label: "Content", value: "Control", icon: FileText },
        { label: "Approvals", value: "Queue", icon: ClipboardCheck },
      ]}
      actions={[
        { label: "Hospitals", to: "/admin/hospitals", icon: Building2 },
        { label: "Pathology labs", to: "/admin/labs", icon: FlaskConical },
        { label: "Reviews", to: "/admin/reviews", icon: MessageSquare },
      ]}
    />
  );
}