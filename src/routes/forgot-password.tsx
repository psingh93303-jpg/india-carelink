import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { Activity, Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot password — CareLink India" },
      { name: "description", content: "Reset your CareLink India account password." },
    ],
  }),
  component: ForgotPasswordPage,
});

const emailSchema = z.string().trim().email().max(255);

function ForgotPasswordPage() {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) return toast.error("Please enter a valid email.");
    setLoading(true);
    const { error } = await sendPasswordReset(parsed.data);
    setLoading(false);
    if (error) return toast.error(error);
    setSent(true);
    toast.success("Check your email for a reset link.");
  };

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-12rem)] max-w-md flex-col justify-center px-4 py-12">
      <div className="rounded-2xl border border-border bg-card p-8 shadow-elegant">
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-hero text-primary-foreground">
            <Activity className="h-5 w-5" />
          </span>
          <span className="text-xl font-bold">CareLink India</span>
        </div>

        {sent ? (
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-2">
              <MailCheck className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              We've sent password reset instructions to <span className="font-medium text-foreground">{email}</span>.
              The link will sign you in and let you set a new password.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/auth">Back to sign in</Link>
            </Button>
          </div>
        ) : (
          <>
            <h1 className="mt-6 text-2xl font-bold tracking-tight">Forgot password</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter your account email and we'll send you a reset link.
            </p>
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={255} autoComplete="email" />
              </div>
              <Button type="submit" className="w-full" disabled={loading} size="lg">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Send reset link
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Remembered it?{" "}
              <Link to="/auth" className="font-medium text-primary hover:underline">Sign in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
