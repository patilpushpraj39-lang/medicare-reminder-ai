import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pill, Mail, Lock, User, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

const searchSchema = z.object({
  mode: z.enum(["signin", "signup", "forgot"]).optional(),
});

type AuthSearch = { mode?: "signin" | "signup" | "forgot" };

export const Route = createFileRoute("/auth")({
  validateSearch: (s): AuthSearch => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Sign in — MediCare Reminder AI" },
      { name: "description", content: "Sign in or create your MediCare Reminder AI account." },
      { property: "og:title", content: "Sign in — MediCare Reminder AI" },
      { property: "og:description", content: "Sign in or create your MediCare Reminder AI account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode } = useSearch({ from: "/auth" });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const res = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (res.error) {
        toast.error(res.error.message || "Google sign-in failed");
        setLoading(false);
        return;
      }
      if (res.redirected) return;
      navigate({ to: "/dashboard" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sign-in failed");
      setLoading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "").trim();
    const password = String(fd.get("password") || "");
    const name = String(fd.get("name") || "").trim();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: name },
          },
        });
        if (error) throw error;
        toast.success("Check your email to verify your account.");
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Password reset link sent.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate({ to: "/dashboard" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const title = mode === "signup" ? "Create your account" : mode === "forgot" ? "Reset your password" : "Welcome back";
  const subtitle =
    mode === "signup"
      ? "Start your medication routine in seconds."
      : mode === "forgot"
      ? "We'll email you a secure reset link."
      : "Sign in to your care dashboard.";

  return (
    <div className="relative flex min-h-screen items-center justify-center gradient-hero px-4 py-10">
      <Link to="/" className="absolute left-6 top-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back home
      </Link>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md rounded-3xl glass p-8"
      >
        <div className="mb-6 flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-md">
            <Pill className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-bold">MediCare<span className="text-gold"> AI</span></span>
        </div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>

        {mode !== "forgot" && (
          <>
            <button
              onClick={handleGoogle}
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-background/60 px-4 py-3 text-sm font-medium transition-colors hover:bg-background disabled:opacity-60"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 10.2v3.8h5.4c-.2 1.4-1.6 4-5.4 4-3.2 0-5.9-2.7-5.9-6s2.6-6 5.9-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.5 14.6 2.5 12 2.5 6.8 2.5 2.6 6.8 2.6 12s4.2 9.5 9.4 9.5c5.4 0 9-3.8 9-9.2 0-.6-.1-1.1-.2-1.6H12z" />
              </svg>
              Continue with Google
            </button>
            <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> or with email <span className="h-px flex-1 bg-border" />
            </div>
          </>
        )}

        <AnimatePresence mode="wait">
          <motion.form
            key={mode}
            onSubmit={onSubmit}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="space-y-3"
          >
            {mode === "signup" && (
              <label className="block">
                <span className="sr-only">Full name</span>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input name="name" required placeholder="Full name" className="w-full rounded-xl border border-border bg-background/60 py-3 pl-10 pr-3 text-sm outline-none focus:border-primary" />
                </div>
              </label>
            )}
            <label className="block">
              <span className="sr-only">Email</span>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input name="email" type="email" required placeholder="you@example.com" className="w-full rounded-xl border border-border bg-background/60 py-3 pl-10 pr-3 text-sm outline-none focus:border-primary" />
              </div>
            </label>
            {mode !== "forgot" && (
              <label className="block">
                <span className="sr-only">Password</span>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input name="password" type="password" required minLength={8} placeholder="At least 8 characters" className="w-full rounded-xl border border-border bg-background/60 py-3 pl-10 pr-3 text-sm outline-none focus:border-primary" />
                </div>
              </label>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-[1.01] disabled:opacity-70"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "signup" ? "Create account" : mode === "forgot" ? "Send reset link" : "Sign in"}
            </button>
          </motion.form>
        </AnimatePresence>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          {mode !== "forgot" ? (
            <Link to="/auth" search={{ mode: "forgot" as const }} className="hover:text-foreground">Forgot password?</Link>
          ) : (
            <Link to="/auth" search={{ mode: "signin" as const }} className="hover:text-foreground">Back to sign in</Link>
          )}
          {mode === "signup" ? (
            <Link to="/auth" search={{ mode: "signin" as const }} className="hover:text-foreground">Have an account? Sign in</Link>
          ) : mode !== "forgot" ? (
            <Link to="/auth" search={{ mode: "signup" as const }} className="hover:text-foreground">New here? Create account</Link>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}