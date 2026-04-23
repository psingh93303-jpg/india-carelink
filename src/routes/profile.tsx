import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";
import { Loader2, User as UserIcon, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  beforeLoad: async ({ location }) => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({ to: "/auth", search: { redirect: location.href } });
    }
  },
  head: () => ({
    meta: [
      { title: "My profile — CareLink India" },
      { name: "description", content: "Manage your CareLink India profile." },
    ],
  }),
  component: ProfilePage,
});

const displayNameSchema = z.string().trim().min(1).max(80);
const usernameSchema = z.string().trim().min(3).max(30).regex(/^[a-zA-Z0-9_.-]+$/, "Only letters, numbers, _ . -");
const phoneSchema = z.string().trim().regex(/^[+0-9 ()-]{7,20}$/, "Enter a valid phone number").or(z.literal(""));
const addressSchema = z.string().trim().max(300).optional();

function ProfilePage() {
  const { user, sendPasswordReset } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("display_name,username,phone,address")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) toast.error(error.message);
        if (data) {
          setDisplayName(data.display_name ?? "");
          setUsername(data.username ?? "");
          setPhone(data.phone ?? "");
          setAddress(data.address ?? "");
        }
        setLoading(false);
      });
  }, [user]);

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const name = displayNameSchema.safeParse(displayName);
    if (!name.success) return toast.error("Please enter your full name.");
    const uname = usernameSchema.safeParse(username);
    if (!uname.success) return toast.error(uname.error.issues[0].message);
    const ph = phoneSchema.safeParse(phone);
    if (!ph.success) return toast.error(ph.error.issues[0].message);
    const ad = addressSchema.safeParse(address);
    if (!ad.success) return toast.error("Address is too long.");

    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: name.data,
        username: uname.data,
        phone: ph.data || "",
        address: ad.data ?? "",
      })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Profile updated.");
  };

  const onResetPassword = async () => {
    if (!user?.email) return;
    setResetting(true);
    const { error } = await sendPasswordReset(user.email);
    setResetting(false);
    if (error) return toast.error(error);
    toast.success("Password reset link sent to your email.");
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-hero text-primary-foreground">
          <UserIcon className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My profile</h1>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-soft">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form onSubmit={onSave} className="space-y-4">
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required maxLength={80} />
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required minLength={3} maxLength={30} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email ?? ""} disabled />
              <p className="mt-1 text-xs text-muted-foreground">Email changes are not supported yet.</p>
            </div>
            <div>
              <Label htmlFor="phone">Phone number</Label>
              <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20} placeholder="+91 98765 43210" />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} maxLength={300} rows={3} placeholder="Optional" />
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save changes
              </Button>
              <Button type="button" variant="outline" onClick={onResetPassword} disabled={resetting}>
                {resetting ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                Send password reset
              </Button>
            </div>
          </form>
        )}
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        <Link to="/" className="hover:underline">← Back to home</Link>
      </p>
    </div>
  );
}
