import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "manager" | "hospital_manager" | "financial_manager" | "user";

const STAFF_ROLES: AppRole[] = ["admin", "manager", "hospital_manager", "financial_manager"];
const HOSPITAL_EDIT_ROLES: AppRole[] = ["admin", "manager", "hospital_manager"];

type SignUpExtras = { displayName: string; username?: string; phone?: string };

type Ctx = {
  session: Session | null;
  user: User | null;
  roles: AppRole[];
  isAdmin: boolean;
  isStaff: boolean;
  canEditHospital: boolean;
  canManageUsers: boolean;
  canManageFinance: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, extras: SignUpExtras) => Promise<{ error: string | null; needsOtp: boolean }>;
  verifyEmailOtp: (email: string, token: string) => Promise<{ error: string | null }>;
  resendSignupOtp: (email: string) => Promise<{ error: string | null }>;
  sendPasswordReset: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

const AuthCtx = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRoles = (uid: string) => {
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", uid)
      .then(({ data }) => setRoles(((data ?? []).map((r) => r.role)) as AppRole[]));
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        setTimeout(() => loadRoles(s.user.id), 0);
      } else {
        setRoles([]);
      }
    });

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) loadRoles(s.user.id);
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUp = async (email: string, password: string, extras: SignUpExtras) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          display_name: extras.displayName,
          username: extras.username ?? "",
          phone: extras.phone ?? "",
        },
      },
    });
    if (error) return { error: error.message, needsOtp: false };
    // Session is null when email confirmation is required → OTP step
    const needsOtp = !data.session;
    return { error: null, needsOtp };
  };

  const verifyEmailOtp = async (email: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({ email, token, type: "signup" });
    return { error: error?.message ?? null };
  };

  const resendSignupOtp = async (email: string) => {
    const { error } = await supabase.auth.resend({ type: "signup", email });
    return { error: error?.message ?? null };
  };

  const sendPasswordReset = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error?.message ?? null };
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const isAdmin = roles.includes("admin");
  const isStaff = roles.some((r) => STAFF_ROLES.includes(r));
  const canEditHospital = roles.some((r) => HOSPITAL_EDIT_ROLES.includes(r));
  const canManageUsers = isAdmin;
  const canManageFinance = isAdmin || roles.includes("financial_manager");

  return (
    <AuthCtx.Provider
      value={{
        session,
        user,
        roles,
        isAdmin,
        isStaff,
        canEditHospital,
        canManageUsers,
        canManageFinance,
        loading,
        signIn,
        signUp,
        verifyEmailOtp,
        resendSignupOtp,
        sendPasswordReset,
        updatePassword,
        signOut,
      }}
    >
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Admin",
  manager: "Manager",
  hospital_manager: "Hospital Manager",
  financial_manager: "Financial Manager",
  user: "User",
};
