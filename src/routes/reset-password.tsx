import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Loader2, Pill } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password — MediCare Reminder AI" },
      { name: "description", content: "Choose a new password for your MediCare account." },
      { property: "og:title", content: "Reset password — MediCare Reminder AI" },
      { property: "og:description", content: "Choose a new password for your MediCare account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password") || "");
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated. You're signed in.");
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center gradient-hero px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl glass p-8"
      >
        <div className="mb-6 flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-md">
            <Pill className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-bold">MediCare<span className="text-gold"> AI</span></span>
        </div>
        <h1 className="text-2xl font-bold">Set a new password</h1>
        <p className="mt-1 text-sm text-muted-foreground">Choose something strong you'll remember.</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input name="password" type="password" required minLength={8} placeholder="New password" className="w-full rounded-xl border border-border bg-background/60 py-3 pl-10 pr-3 text-sm outline-none focus:border-primary" />
          </div>
          <button disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 disabled:opacity-70">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />} Update password
          </button>
        </form>
      </motion.div>
    </div>
  );
}