import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { Activity, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  validateSearch: z.object({
    redirect: z.string().optional(),
  }),
  beforeLoad: async ({ search }) => {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      throw redirect({ to: search.redirect ?? "/" });
    }
  },
  head: () => ({
    meta: [
      { title: "Sign in — MediFinder" },
      { name: "description", content: "Sign in or create an account on MediFinder." },
    ],
  }),
  component: AuthPage,
});

const emailSchema = z.string().trim().email().max(255);
const passwordSchema = z.string().min(6).max(72);
const nameSchema = z.string().trim().min(1).max(80);

function AuthPage() {
  const { signIn, signUp } = useAuth();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const emailParsed = emailSchema.safeParse(email);
      const pwParsed = passwordSchema.safeParse(password);
      if (!emailParsed.success) return toast.error("Please enter a valid email.");
      if (!pwParsed.success) return toast.error("Password must be at least 6 characters.");

      if (mode === "signup") {
        const nameParsed = nameSchema.safeParse(displayName);
        if (!nameParsed.success) return toast.error("Please enter your name.");
        const { error } = await signUp(emailParsed.data, pwParsed.data, nameParsed.data);
        if (error) return toast.error(error);
        toast.success("Account created! You're signed in.");
        navigate({ to: search.redirect ?? "/" });
      } else {
        const { error } = await signIn(emailParsed.data, pwParsed.data);
        if (error) return toast.error(error);
        toast.success("Welcome back!");
        navigate({ to: search.redirect ?? "/" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-12rem)] max-w-md flex-col justify-center px-4 py-12">
      <div className="rounded-2xl border border-border bg-card p-8 shadow-elegant">
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-hero text-primary-foreground">
            <Activity className="h-5 w-5" />
          </span>
          <span className="text-xl font-bold">MediFinder</span>
        </div>
        <h1 className="mt-6 text-2xl font-bold tracking-tight">
          {mode === "signin" ? "Sign in" : "Create account"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "signin"
            ? "Welcome back. Sign in to access your account."
            : "Sign up to save favorites and write reviews."}
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {mode === "signup" && (
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required maxLength={80} />
            </div>
          )}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={255} autoComplete="email" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} maxLength={72} autoComplete={mode === "signin" ? "current-password" : "new-password"} />
          </div>

          <Button type="submit" className="w-full" disabled={loading} size="lg">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {mode === "signin" ? "Sign in" : "Create account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="font-medium text-primary hover:underline"
          >
            {mode === "signin" ? "Sign up" : "Sign in"}
          </button>
        </p>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          <Link to="/" className="hover:underline">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
