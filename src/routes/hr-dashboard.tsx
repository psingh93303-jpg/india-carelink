import { createFileRoute } from "@tanstack/react-router";
import { BriefcaseBusiness, ClipboardList, UserPlus, UsersRound } from "lucide-react";
import { RoleDashboard } from "@/components/RoleDashboard";
import { requireDashboardRole } from "@/lib/dashboard-access";

export const Route = createFileRoute("/hr-dashboard")({
  beforeLoad: ({ location }) => requireDashboardRole(location.pathname, ["admin", "human_resource_manager"]),
  head: () => ({ meta: [{ title: "HR Dashboard — CareLink India" }] }),
  component: HrDashboard,
});

function HrDashboard() {
  return (
    <RoleDashboard
      badge="HR Portal"
      title="Human Resource Manager Dashboard"
      subtitle="Coordinate staff records, hiring workflows, employee documentation and workforce operations."
      metrics={[
        { label: "Staff", value: "Managed", icon: UsersRound },
        { label: "Hiring", value: "Pipeline", icon: UserPlus },
        { label: "Records", value: "Organized", icon: ClipboardList },
        { label: "Roles", value: "Tracked", icon: BriefcaseBusiness },
      ]}
      actions={[
        { label: "Staff records", to: "/admin/hospitals", icon: UsersRound },
        { label: "Hiring pipeline", to: "/admin", icon: UserPlus },
        { label: "Employee records", to: "/admin", icon: ClipboardList },
      ]}
    />
  );
}