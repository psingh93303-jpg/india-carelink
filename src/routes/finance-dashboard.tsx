import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, FileSpreadsheet, IndianRupee, ReceiptText, TrendingUp } from "lucide-react";
import { RoleDashboard } from "@/components/RoleDashboard";
import { requireDashboardRole } from "@/lib/dashboard-access";

export const Route = createFileRoute("/finance-dashboard")({
  beforeLoad: ({ location }) => requireDashboardRole(location.pathname, ["admin", "financial_manager"]),
  head: () => ({ meta: [{ title: "Finance Dashboard — CareLink India" }] }),
  component: FinanceDashboard,
});

function FinanceDashboard() {
  return (
    <RoleDashboard
      badge="Finance Portal"
      title="Financial Manager Dashboard"
      subtitle="Track payments, revenue summaries, reporting readiness and premium listing performance."
      metrics={[
        { label: "Payments", value: "Tracked", icon: IndianRupee },
        { label: "Revenue", value: "Reports", icon: TrendingUp },
        { label: "Invoices", value: "Ready", icon: ReceiptText },
        { label: "Exports", value: "CSV", icon: FileSpreadsheet },
      ]}
      actions={[
        { label: "Revenue reports", to: "/admin", icon: BarChart3 },
        { label: "Premium listings", to: "/admin/hospitals", icon: IndianRupee },
        { label: "Export data", to: "/admin", icon: FileSpreadsheet },
      ]}
    />
  );
}