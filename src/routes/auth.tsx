import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { Activity, Loader2, MailCheck } from "lucide-react";
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
      { title: "Sign in — CareLink India" },
      { name: "description", content: "Sign in or create an account on CareLink India." },
    ],
  }),
  component: AuthPage,
});

const emailSchema = z.string().trim().email().max(255);
const passwordSchema = z.string().min(6).max(72);
const nameSchema = z.string().trim().min(1).max(80);
const usernameSchema = z.string().trim().min(3).max(30).regex(/^[a-zA-Z0-9_.-]+$/, "Only letters, numbers, _ . -");
const phoneSchema = z.string().trim().regex(/^[+0-9 ()-]{7,20}$/, "Enter a valid phone number");
const otpSchema = z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code");

type Mode = "signin" | "signup" | "verify";

function AuthPage() {
  const { signIn, signUp, verifyEmailOtp, resendSignupOtp } = useAuth();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "verify") {
        const otpParsed = otpSchema.safeParse(otp);
        if (!otpParsed.success) return toast.error(otpParsed.error.issues[0].message);
        const { error } = await verifyEmailOtp(email, otpParsed.data);
        if (error) return toast.error(error);
        toast.success("Email verified! You're signed in.");
        navigate({ to: search.redirect ?? "/" });
        return;
      }

      const emailParsed = emailSchema.safeParse(email);
      const pwParsed = passwordSchema.safeParse(password);
      if (!emailParsed.success) return toast.error("Please enter a valid email.");
      if (!pwParsed.success) return toast.error("Password must be at least 6 characters.");

      if (mode === "signup") {
        const nameParsed = nameSchema.safeParse(displayName);
        if (!nameParsed.success) return toast.error("Please enter your full name.");
        const userParsed = usernameSchema.safeParse(username);
        if (!userParsed.success) return toast.error(userParsed.error.issues[0].message);
        const phoneParsed = phoneSchema.safeParse(phone);
        if (!phoneParsed.success) return toast.error(phoneParsed.error.issues[0].message);

        const { error, needsOtp } = await signUp(emailParsed.data, pwParsed.data, {
          displayName: nameParsed.data,
          username: userParsed.data,
          phone: phoneParsed.data,
        });
        if (error) return toast.error(error);
        if (needsOtp) {
          toast.success("We sent a 6-digit code to your email.");
          setMode("verify");
          setOtp("");
        } else {
          toast.success("Account created!");
          navigate({ to: search.redirect ?? "/" });
        }
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

  const onResend = async () => {
    const emailParsed = emailSchema.safeParse(email);
    if (!emailParsed.success) return toast.error("Enter your email first.");
    const { error } = await resendSignupOtp(emailParsed.data);
    if (error) return toast.error(error);
    toast.success("New code sent.");
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

        {mode === "verify" ? (
          <>
            <h1 className="mt-6 text-2xl font-bold tracking-tight flex items-center gap-2">
              <MailCheck className="h-6 w-6 text-primary" /> Verify your email
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter the 6-digit code we sent to <span className="font-medium text-foreground">{email}</span>.
            </p>
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div>
                <Label htmlFor="otp">Verification code</Label>
                <Input
                  id="otp"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="123456"
                  className="text-center text-lg tracking-[0.5em]"
                  maxLength={6}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading} size="lg">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Verify & continue
              </Button>
              <div className="flex items-center justify-between text-sm">
                <button type="button" onClick={onResend} className="text-primary hover:underline">
                  Resend code
                </button>
                <button type="button" onClick={() => setMode("signup")} className="text-muted-foreground hover:underline">
                  Use a different email
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <h1 className="mt-6 text-2xl font-bold tracking-tight">
              {mode === "signin" ? "Sign in" : "Create account"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "signin"
                ? "Welcome back. Sign in to access your account."
                : "Sign up to save favorites, write reviews and more."}
            </p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              {mode === "signup" && (
                <>
                  <div>
                    <Label htmlFor="name">Full name</Label>
                    <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required maxLength={80} />
                  </div>
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required minLength={3} maxLength={30} placeholder="e.g. ravi_kumar" />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone number</Label>
                    <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required maxLength={20} placeholder="+91 98765 43210" autoComplete="tel" />
                  </div>
                </>
              )}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={255} autoComplete="email" />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} maxLength={72} autoComplete={mode === "signin" ? "current-password" : "new-password"} />
                {mode === "signin" && (
                  <div className="mt-1.5 text-right">
                    <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
                  </div>
                )}
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
          </>
        )}

        <p className="mt-2 text-center text-xs text-muted-foreground">
          <Link to="/" className="hover:underline">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
