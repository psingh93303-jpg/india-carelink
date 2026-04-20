import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/forbidden")({
  head: () => ({ meta: [{ title: "Access denied — Admin · MediFinder" }] }),
  component: Forbidden,
});

function Forbidden() {
  return (
    <div className="mx-auto max-w-md text-center py-16">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <Lock className="h-7 w-7" />
      </span>
      <h1 className="mt-4 text-2xl font-bold">Admin access required</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Your account doesn't have admin privileges. Ask an existing admin to grant you the role from
        the Users panel.
      </p>
      <Button asChild className="mt-6"><Link to="/">Back to home</Link></Button>
    </div>
  );
}
