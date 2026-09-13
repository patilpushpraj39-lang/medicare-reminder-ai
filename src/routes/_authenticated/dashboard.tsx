import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock,
  Edit3,
  Loader2,
  LogOut,
  MessageCircle,
  Pill,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — MediCare Reminder AI" },
      { name: "description", content: "Manage medicines, reminders, and dose history." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardPage,
});

type Medicine = Tables<"medicines">;
type MedicineLog = Tables<"medicine_logs">;
type DoseStatus = "taken" | "pending" | "missed";
type Dose = {
  id: string;
  medicineId: string;
  logId?: string;
  name: string;
  dosage: string;
  type: string;
  color: string;
  time: string;
  scheduledAt: string;
  status: DoseStatus;
};

const FIELD_CLASS =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary";

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const startOfDay = (date: Date) => {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
};

const atTime = (date: Date, time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  const value = new Date(date);
  value.setHours(hours || 0, minutes || 0, 0, 0);
  return value;
};

const buildDoses = (medicines: Medicine[], logs: MedicineLog[], date: Date): Dose[] => {
  const dateKey = formatDateKey(date);
  const logsBySchedule = new Map(
    logs.map((log) => [`${log.medicine_id}-${log.scheduled_at}`, log]),
  );
  return medicines
    .filter(
      (medicine) =>
        medicine.start_date <= dateKey && (!medicine.end_date || medicine.end_date >= dateKey),
    )
    .flatMap((medicine) =>
      medicine.times.map((time) => {
        const scheduledAt = atTime(date, time).toISOString();
        const log = logsBySchedule.get(`${medicine.id}-${scheduledAt}`);
        const status = log?.status === "taken" || log?.status === "missed" ? log.status : "pending";
        return {
          id: `${medicine.id}-${scheduledAt}`,
          medicineId: medicine.id,
          logId: log?.id,
          name: medicine.name,
          dosage: medicine.dosage || "Dose not specified",
          type: medicine.type,
          color: medicine.color || "#0d7a5f",
          time,
          scheduledAt,
          status,
        } satisfies Dose;
      }),
    )
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
};

function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ id: string; name?: string } | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [logs, setLogs] = useState<MedicineLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Medicine | null>(null);
  const [assistantOpen, setAssistantOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (authError || !auth.user) throw authError || new Error("Please sign in again.");
      setUser({
        id: auth.user.id,
        name: (auth.user.user_metadata?.full_name as string) || auth.user.email?.split("@")[0],
      });
      const weekStart = startOfDay(new Date());
      weekStart.setDate(weekStart.getDate() - 6);
      const tomorrow = startOfDay(new Date());
      tomorrow.setDate(tomorrow.getDate() + 1);
      const [medicineResult, logResult] = await Promise.all([
        supabase.from("medicines").select("*").order("name"),
        supabase
          .from("medicine_logs")
          .select("*")
          .gte("scheduled_at", weekStart.toISOString())
          .lt("scheduled_at", tomorrow.toISOString()),
      ]);
      if (medicineResult.error) throw medicineResult.error;
      if (logResult.error) throw logResult.error;
      setMedicines(medicineResult.data || []);
      setLogs(logResult.data || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load your care plan.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const today = useMemo(() => new Date(), []);
  const doses = useMemo(() => buildDoses(medicines, logs, today), [medicines, logs, today]);
  const normalizedQuery = query.trim().toLowerCase();
  const filteredDoses = doses.filter(
    (dose) =>
      !normalizedQuery ||
      `${dose.name} ${dose.dosage} ${dose.type}`.toLowerCase().includes(normalizedQuery),
  );
  const filteredMedicines = medicines.filter(
    (medicine) =>
      !normalizedQuery ||
      `${medicine.name} ${medicine.dosage || ""} ${medicine.doctor_name || ""}`
        .toLowerCase()
        .includes(normalizedQuery),
  );
  const takenCount = doses.filter((dose) => dose.status === "taken").length;
  const missedCount = doses.filter((dose) => dose.status === "missed").length;
  const pending = doses.filter((dose) => dose.status === "pending");
  const adherence = doses.length ? Math.round((takenCount / doses.length) * 100) : 0;
  const nextDose =
    pending.find((dose) => new Date(dose.scheduledAt).getTime() >= Date.now()) || pending[0];

  const weekly = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const date = startOfDay(new Date());
        date.setDate(date.getDate() - (6 - index));
        const dayDoses = buildDoses(medicines, logs, date);
        const complete = dayDoses.filter((dose) => dose.status === "taken").length;
        return {
          day: date.toLocaleDateString(undefined, { weekday: "short" }),
          adherence: dayDoses.length ? Math.round((complete / dayDoses.length) * 100) : 0,
        };
      }),
    [medicines, logs],
  );

  useEffect(() => {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    const timers = doses
      .filter((dose) => dose.status === "pending")
      .map((dose) => {
        const delay = new Date(dose.scheduledAt).getTime() - Date.now();
        if (delay <= 0 || delay > 2_147_000_000) return undefined;
        return window.setTimeout(
          () =>
            new Notification(`Time for ${dose.name}`, {
              body: `${dose.dosage} is scheduled now.`,
              icon: "/medicare-reminder-ai/favicon.ico",
            }),
          delay,
        );
      })
      .filter((timer): timer is number => timer !== undefined);
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [doses]);

  const requestNotifications = async () => {
    if (!("Notification" in window))
      return toast.error("This browser does not support notifications.");
    const permission = await Notification.requestPermission();
    if (permission === "granted") toast.success("Reminders are enabled while this site is open.");
    else toast.error("Notification permission was not granted.");
  };

  const markDose = async (dose: Dose, status: Exclude<DoseStatus, "pending">) => {
    if (!user) return;
    const values = {
      user_id: user.id,
      medicine_id: dose.medicineId,
      scheduled_at: dose.scheduledAt,
      status,
      taken_at: status === "taken" ? new Date().toISOString() : null,
    };
    try {
      const result = dose.logId
        ? await supabase.from("medicine_logs").update(values).eq("id", dose.logId).select().single()
        : await supabase.from("medicine_logs").insert(values).select().single();
      if (result.error) throw result.error;
      setLogs((current) => [...current.filter((log) => log.id !== result.data.id), result.data]);
      toast.success(status === "taken" ? "Dose marked as taken." : "Dose marked as missed.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update this dose.");
    }
  };

  const saveMedicine = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    const form = new FormData(event.currentTarget);
    const times = String(form.get("times") || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    if (!times.length || times.some((time) => !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)))
      return toast.error("Enter reminder times as HH:MM, separated by commas.");
    const values = {
      user_id: user.id,
      name: String(form.get("name") || "").trim(),
      dosage: String(form.get("dosage") || "").trim() || null,
      type: String(form.get("type") || "tablet") as Medicine["type"],
      quantity: Math.max(0, Number(form.get("quantity") || 0)),
      frequency: "daily",
      times: [...new Set(times)].sort(),
      start_date: String(form.get("start_date") || formatDateKey(new Date())),
      end_date: String(form.get("end_date") || "") || null,
      food_timing: String(form.get("food_timing") || "any") as Medicine["food_timing"],
      doctor_name: String(form.get("doctor_name") || "").trim() || null,
      notes: String(form.get("notes") || "").trim() || null,
      color: String(form.get("color") || "#0d7a5f"),
    };
    if (!values.name) return toast.error("Medicine name is required.");
    setSaving(true);
    try {
      const result = editing
        ? await supabase.from("medicines").update(values).eq("id", editing.id).select().single()
        : await supabase.from("medicines").insert(values).select().single();
      if (result.error) throw result.error;
      setMedicines((current) =>
        [...current.filter((item) => item.id !== result.data.id), result.data].sort((a, b) =>
          a.name.localeCompare(b.name),
        ),
      );
      setEditorOpen(false);
      setEditing(null);
      toast.success(editing ? "Medicine updated." : "Medicine added to your care plan.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save this medicine.");
    } finally {
      setSaving(false);
    }
  };

  const removeMedicine = async (medicine: Medicine) => {
    if (!window.confirm(`Remove ${medicine.name} and its dose history?`)) return;
    const { error } = await supabase.from("medicines").delete().eq("id", medicine.id);
    if (error) return toast.error(error.message);
    setMedicines((current) => current.filter((item) => item.id !== medicine.id));
    setLogs((current) => current.filter((log) => log.medicine_id !== medicine.id));
    toast.success("Medicine removed.");
  };

  const openEditor = (medicine?: Medicine) => {
    setEditing(medicine || null);
    setEditorOpen(true);
  };
  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  if (loading)
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="text-center text-sm text-muted-foreground">
          <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin text-primary" />
          Loading your care plan…
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
              <Pill className="h-5 w-5" />
            </span>
            <span className="hidden font-display font-bold sm:inline">
              MediCare<span className="text-gold"> AI</span>
            </span>
          </Link>
          <label className="relative hidden max-w-md flex-1 md:block">
            <span className="sr-only">Search medicines</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search medicines or doctors…"
              className="w-full rounded-xl border border-border bg-secondary/40 py-2 pl-10 pr-3 text-sm outline-none focus:border-primary"
            />
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={requestNotifications}
              className="grid h-9 w-9 place-items-center rounded-xl border border-border text-muted-foreground hover:text-primary"
              aria-label="Enable browser reminders"
            >
              <Bell className="h-4 w-4" />
            </button>
            <div className="hidden items-center gap-2 rounded-xl border border-border px-3 py-1.5 sm:flex">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-primary to-gold text-xs font-bold text-primary-foreground">
                {(user?.name || "M").charAt(0).toUpperCase()}
              </span>
              <span className="text-sm font-medium">{user?.name || "Member"}</span>
            </div>
            <button
              onClick={signOut}
              className="grid h-9 w-9 place-items-center rounded-xl border border-border text-muted-foreground hover:text-destructive"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 md:hidden">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search medicines…"
            className={FIELD_CLASS}
          />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-wrap items-end justify-between gap-4"
        >
          <div>
            <p className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
            <h1 className="mt-1 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Today's care plan
            </h1>
          </div>
          <button
            onClick={() => openEditor()}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30"
          >
            <Plus className="h-4 w-4" /> Add medicine
          </button>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <section className="rounded-3xl glass p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Daily progress</h2>
              <span className="text-xs text-muted-foreground">
                {takenCount}/{doses.length} doses
              </span>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              <ProgressStat label="Taken" value={takenCount} color="text-primary" />
              <ProgressStat label="Pending" value={pending.length} color="text-gold" />
              <ProgressStat label="Missed" value={missedCount} color="text-destructive" />
            </div>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-muted">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${adherence}%` }}
                className="h-full rounded-full bg-gradient-to-r from-primary to-gold"
              />
            </div>
            <p className="mt-2 text-right text-xs text-muted-foreground">{adherence}% complete</p>
          </section>
          <section className="rounded-3xl bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground shadow-lg shadow-primary/25">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest opacity-80">
              <Sparkles className="h-3.5 w-3.5" /> Next reminder
            </div>
            {nextDose ? (
              <>
                <p className="mt-4 font-display text-3xl font-bold">{nextDose.name}</p>
                <p className="mt-1 text-sm opacity-90">{nextDose.dosage}</p>
                <div className="mt-6 flex items-end justify-between">
                  <div>
                    <p className="text-xs opacity-80">Scheduled</p>
                    <p className="font-display text-2xl font-semibold">{nextDose.time}</p>
                  </div>
                  <Countdown scheduledAt={nextDose.scheduledAt} />
                </div>
                <button
                  onClick={() => void markDose(nextDose, "taken")}
                  className="mt-6 w-full rounded-xl bg-background/20 py-2.5 text-sm font-semibold hover:bg-background/30"
                >
                  Mark as taken
                </button>
              </>
            ) : (
              <div className="mt-7">
                <CheckCircle2 className="h-9 w-9" />
                <p className="mt-3 font-display text-2xl font-bold">All caught up</p>
                <p className="mt-1 text-sm opacity-80">
                  Add a medicine or enjoy the rest of your day.
                </p>
              </div>
            )}
          </section>
          <section className="rounded-3xl glass p-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Private by design</h2>
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Your medicines and dose logs are stored in your secured account. Database policies
              restrict every record to its owner.
            </p>
            <button
              onClick={requestNotifications}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold hover:border-primary"
            >
              <Bell className="h-4 w-4" /> Enable browser reminders
            </button>
          </section>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <section className="rounded-3xl glass p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Today's timeline</h2>
              <span className="text-xs text-muted-foreground">
                {filteredDoses.length} scheduled
              </span>
            </div>
            {filteredDoses.length ? (
              <ul className="mt-5 space-y-3">
                {filteredDoses.map((dose) => (
                  <DoseRow
                    key={dose.id}
                    dose={dose}
                    onMark={(status) => void markDose(dose, status)}
                  />
                ))}
              </ul>
            ) : (
              <EmptyState
                title={doses.length ? "No medicines match your search" : "No doses scheduled today"}
                body={
                  doses.length
                    ? "Try a different search term."
                    : "Add your first medicine to create today's care plan."
                }
                action={!doses.length ? () => openEditor() : undefined}
              />
            )}
          </section>
          <section className="rounded-3xl glass p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Weekly adherence</h2>
              <span className="text-xs text-muted-foreground">Last 7 days</span>
            </div>
            <div className="mt-6 grid grid-cols-7 gap-2">
              {weekly.map((item, index) => (
                <div key={`${item.day}-${index}`} className="text-center">
                  <div className="flex h-28 items-end rounded-xl bg-muted/70 p-1">
                    <div
                      className="w-full rounded-lg bg-gradient-to-t from-primary to-gold"
                      style={{ height: `${Math.max(item.adherence, 4)}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{item.day}</p>
                  <p className="text-xs font-semibold">{item.adherence}%</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <section id="medicines" className="rounded-3xl glass p-6 lg:col-span-2">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="flex items-center gap-2 font-semibold">
                  <CalendarDays className="h-4 w-4 text-primary" /> My medicines
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Edit schedules or remove medicines you no longer take.
                </p>
              </div>
              <button
                onClick={() => openEditor()}
                className="rounded-xl border border-border px-3 py-2 text-xs font-semibold hover:border-primary"
              >
                <Plus className="mr-1 inline h-3.5 w-3.5" /> Add
              </button>
            </div>
            {filteredMedicines.length ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {filteredMedicines.map((medicine) => (
                  <MedicineCard
                    key={medicine.id}
                    medicine={medicine}
                    onEdit={() => openEditor(medicine)}
                    onRemove={() => void removeMedicine(medicine)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No medicines yet"
                body="Add your first medication and reminder time."
                action={() => openEditor()}
              />
            )}
          </section>
          <aside className="rounded-3xl border border-gold/30 bg-gradient-to-br from-gold/10 via-background to-primary/5 p-6">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gold/20 text-gold">
                <Sparkles className="h-4 w-4" />
              </span>
              <h2 className="font-semibold">Safety assistant</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Get help reading your schedule and preparing questions for a pharmacist or doctor.
            </p>
            <div className="mt-4 rounded-2xl border border-border bg-background/70 p-3 text-xs text-muted-foreground">
              For safety, it never diagnoses, recommends a dose, or replaces a healthcare
              professional.
            </div>
            <button
              onClick={() => setAssistantOpen(true)}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background"
            >
              <MessageCircle className="h-4 w-4" /> Open assistant
            </button>
          </aside>
        </div>
      </main>
      {editorOpen && (
        <MedicineEditor
          medicine={editing}
          saving={saving}
          onClose={() => {
            setEditorOpen(false);
            setEditing(null);
          }}
          onSave={saveMedicine}
        />
      )}
      {assistantOpen && <SafetyAssistant doses={doses} onClose={() => setAssistantOpen(false)} />}
    </div>
  );
}

function Countdown({ scheduledAt }: { scheduledAt: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);
  const difference = new Date(scheduledAt).getTime() - now;
  if (difference < 0) return <p className="text-sm font-semibold">overdue</p>;
  const minutes = Math.floor(difference / 60_000);
  return (
    <p className="text-sm font-semibold">
      in {minutes >= 60 ? `${Math.floor(minutes / 60)}h ` : ""}
      {minutes % 60}m
    </p>
  );
}

function ProgressStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-2xl bg-background/60 p-3">
      <p className={`font-display text-2xl font-bold ${color}`}>{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function EmptyState({ title, body, action }: { title: string; body: string; action?: () => void }) {
  return (
    <div className="mt-5 rounded-2xl border border-dashed border-border p-8 text-center">
      <Pill className="mx-auto h-7 w-7 text-primary" />
      <p className="mt-3 font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      {action && (
        <button
          onClick={action}
          className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Add medicine
        </button>
      )}
    </div>
  );
}

function DoseRow({ dose, onMark }: { dose: Dose; onMark: (status: "taken" | "missed") => void }) {
  const chip =
    dose.status === "taken"
      ? "bg-primary/15 text-primary"
      : dose.status === "missed"
        ? "bg-destructive/15 text-destructive"
        : "bg-gold/15 text-gold";
  return (
    <li className="flex items-center gap-3 rounded-2xl border border-border bg-background/60 p-4">
      <span
        className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
        style={{ background: `${dose.color}22`, color: dose.color }}
      >
        <Pill className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{dose.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {dose.dosage} · {dose.time}
        </p>
      </div>
      <span className={`hidden rounded-full px-2.5 py-1 text-xs font-semibold sm:inline ${chip}`}>
        {dose.status[0].toUpperCase() + dose.status.slice(1)}
      </span>
      {dose.status === "pending" ? (
        <div className="flex gap-1">
          <button
            onClick={() => onMark("taken")}
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
          >
            Take
          </button>
          <button
            onClick={() => onMark("missed")}
            className="rounded-lg border border-border px-2 py-1.5 text-muted-foreground hover:text-destructive"
            aria-label={`Mark ${dose.name} missed`}
          >
            <XCircle className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : dose.status === "taken" ? (
        <CheckCircle2 className="h-4 w-4 text-primary" />
      ) : (
        <XCircle className="h-4 w-4 text-destructive" />
      )}
    </li>
  );
}

function MedicineCard({
  medicine,
  onEdit,
  onRemove,
}: {
  medicine: Medicine;
  onEdit: () => void;
  onRemove: () => void;
}) {
  return (
    <article className="rounded-2xl border border-border bg-background/60 p-4">
      <div className="flex gap-3">
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
          style={{
            background: `${medicine.color || "#0d7a5f"}22`,
            color: medicine.color || "#0d7a5f",
          }}
        >
          <Pill className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{medicine.name}</p>
          <p className="text-xs capitalize text-muted-foreground">
            {medicine.dosage || "Dose not specified"} · {medicine.type}
          </p>
        </div>
        <button
          onClick={onEdit}
          className="text-muted-foreground hover:text-primary"
          aria-label={`Edit ${medicine.name}`}
        >
          <Edit3 className="h-4 w-4" />
        </button>
        <button
          onClick={onRemove}
          className="text-muted-foreground hover:text-destructive"
          aria-label={`Remove ${medicine.name}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {medicine.times.map((time) => (
          <span key={time} className="rounded-full bg-secondary px-2.5 py-1 text-xs">
            <Clock className="mr-1 inline h-3 w-3" />
            {time}
          </span>
        ))}
        {medicine.food_timing !== "any" && (
          <span className="rounded-full bg-secondary px-2.5 py-1 text-xs capitalize">
            {medicine.food_timing.replaceAll("_", " ")}
          </span>
        )}
      </div>
    </article>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium">
      <span className="mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}

function MedicineEditor({
  medicine,
  saving,
  onClose,
  onSave,
}: {
  medicine: Medicine | null;
  saving: boolean;
  onClose: () => void;
  onSave: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-foreground/45 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="medicine-editor-title"
    >
      <form
        onSubmit={onSave}
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-background p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 id="medicine-editor-title" className="font-display text-2xl font-bold">
              {medicine ? "Edit medicine" : "Add medicine"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Store the prescription details exactly as provided.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-xl border border-border"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Medicine name">
            <input
              name="name"
              required
              defaultValue={medicine?.name}
              className={FIELD_CLASS}
              placeholder="e.g. Metformin"
            />
          </Field>
          <Field label="Dosage">
            <input
              name="dosage"
              defaultValue={medicine?.dosage || ""}
              className={FIELD_CLASS}
              placeholder="e.g. 500 mg"
            />
          </Field>
          <Field label="Type">
            <select name="type" defaultValue={medicine?.type || "tablet"} className={FIELD_CLASS}>
              <option value="tablet">Tablet</option>
              <option value="capsule">Capsule</option>
              <option value="syrup">Syrup</option>
              <option value="injection">Injection</option>
              <option value="drops">Drops</option>
              <option value="inhaler">Inhaler</option>
            </select>
          </Field>
          <Field label="Quantity">
            <input
              name="quantity"
              type="number"
              min="0"
              defaultValue={medicine?.quantity ?? 0}
              className={FIELD_CLASS}
            />
          </Field>
          <Field label="Reminder times">
            <input
              name="times"
              required
              defaultValue={medicine?.times.join(", ") || "08:00"}
              className={FIELD_CLASS}
              placeholder="08:00, 20:00"
            />
            <span className="mt-1 block text-xs text-muted-foreground">
              24-hour HH:MM; separate times with commas.
            </span>
          </Field>
          <Field label="Food timing">
            <select
              name="food_timing"
              defaultValue={medicine?.food_timing || "any"}
              className={FIELD_CLASS}
            >
              <option value="any">Any time</option>
              <option value="before_food">Before food</option>
              <option value="after_food">After food</option>
              <option value="empty_stomach">Empty stomach</option>
            </select>
          </Field>
          <Field label="Start date">
            <input
              name="start_date"
              type="date"
              required
              defaultValue={medicine?.start_date || formatDateKey(new Date())}
              className={FIELD_CLASS}
            />
          </Field>
          <Field label="End date (optional)">
            <input
              name="end_date"
              type="date"
              defaultValue={medicine?.end_date || ""}
              className={FIELD_CLASS}
            />
          </Field>
          <Field label="Doctor (optional)">
            <input
              name="doctor_name"
              defaultValue={medicine?.doctor_name || ""}
              className={FIELD_CLASS}
              placeholder="Doctor name"
            />
          </Field>
          <Field label="Card color">
            <input
              name="color"
              type="color"
              defaultValue={medicine?.color || "#0d7a5f"}
              className="h-11 w-full rounded-xl border border-border bg-background p-1"
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Notes (optional)">
              <textarea
                name="notes"
                rows={3}
                defaultValue={medicine?.notes || ""}
                className={FIELD_CLASS}
                placeholder="Prescription instructions or notes"
              />
            </Field>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold"
          >
            Cancel
          </button>
          <button
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {medicine ? "Save changes" : "Add medicine"}
          </button>
        </div>
      </form>
    </div>
  );
}

function SafetyAssistant({ doses, onClose }: { doses: Dose[]; onClose: () => void }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(
    "Ask what is scheduled today or what to do after a missed dose.",
  );
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const normalized = question.toLowerCase();
    if (/today|schedule|next|when/.test(normalized))
      setAnswer(
        doses.length
          ? doses.map((dose) => `${dose.name} at ${dose.time} (${dose.status})`).join(", ")
          : "You have no medicines scheduled today.",
      );
    else if (/miss|forgot|late/.test(normalized))
      setAnswer(
        "Do not double a dose unless your prescriber told you to. Check the label and contact your pharmacist or doctor for medicine-specific instructions.",
      );
    else if (/side effect|interaction|together|safe|dose/.test(normalized))
      setAnswer(
        "Interactions and dose changes require a pharmacist or doctor who knows your health history. I can read your saved schedule, but I cannot confirm that a combination or dose is safe.",
      );
    else
      setAnswer(
        "I can summarize your saved schedule and help prepare questions for your clinician. For symptoms or treatment decisions, contact a qualified healthcare professional; use emergency services for urgent symptoms.",
      );
  };
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-foreground/45 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="assistant-title"
    >
      <div className="w-full max-w-lg rounded-3xl bg-background p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 id="assistant-title" className="font-display text-2xl font-bold">
              Safety assistant
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Schedule guidance, not medical advice.
            </p>
          </div>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-xl border border-border"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-5 min-h-28 rounded-2xl bg-secondary/60 p-4 text-sm leading-6">
          {answer}
        </div>
        <form onSubmit={submit} className="mt-4 flex gap-2">
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            required
            className={FIELD_CLASS}
            placeholder="What is my next medicine?"
          />
          <button className="rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground">
            Ask
          </button>
        </form>
      </div>
    </div>
  );
}
