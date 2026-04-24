import { createFileRoute } from "@tanstack/react-router";
import { Building2, Clock3, Stethoscope, UsersRound } from "lucide-react";
import { RoleDashboard } from "@/components/RoleDashboard";
import { requireDashboardRole } from "@/lib/dashboard-access";

export const Route = createFileRoute("/hospital-dashboard")({
  beforeLoad: ({ location }) => requireDashboardRole(location.pathname, ["admin", "manager", "hospital_manager"]),
  head: () => ({ meta: [{ title: "Hospital Dashboard — CareLink India" }] }),
  component: HospitalDashboard,
});

function HospitalDashboard() {
  return (
    <RoleDashboard
      badge="Hospital Portal"
      title="Hospital Manager Dashboard"
      subtitle="Manage hospital profile details, doctors, departments, staff visibility and operating information."
      metrics={[
        { label: "Profile", value: "Editable", icon: Building2 },
        { label: "Doctors", value: "Managed", icon: Stethoscope },
        { label: "Departments", value: "Updated", icon: UsersRound },
        { label: "Timings", value: "Active", icon: Clock3 },
      ]}
      actions={[
        { label: "Hospital profile", to: "/admin/hospitals", icon: Building2 },
        { label: "Doctors", to: "/admin/hospitals", icon: Stethoscope },
        { label: "Departments", to: "/admin/hospitals", icon: UsersRound },
      ]}
    />
  );
}