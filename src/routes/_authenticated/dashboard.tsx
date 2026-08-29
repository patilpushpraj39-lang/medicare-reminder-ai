import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  Droplet,
  HeartPulse,
  LogOut,
  Pill,
  Plus,
  Search,
  Settings,
  Sparkles,
  TrendingUp,
  User as UserIcon,
  XCircle,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — MediCare Reminder AI" },
      { name: "description", content: "Today's medicines, adherence, and health at a glance." },
      { property: "og:title", content: "Dashboard — MediCare Reminder AI" },
      { property: "og:description", content: "Today's medicines, adherence, and health at a glance." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardPage,
});

type Status = "taken" | "pending" | "missed";
type Dose = { id: string; name: string; dosage: string; time: string; status: Status; color: string };

const seedDoses: Dose[] = [
  { id: "1", name: "Metformin", dosage: "500 mg · Tablet", time: "08:00", status: "taken", color: "#0d7a5f" },
  { id: "2", name: "Vitamin D3", dosage: "1000 IU · Capsule", time: "09:30", status: "taken", color: "#c9a84c" },
  { id: "3", name: "Lisinopril", dosage: "10 mg · Tablet", time: "13:00", status: "pending", color: "#64748b" },
  { id: "4", name: "Atorvastatin", dosage: "20 mg · Tablet", time: "20:00", status: "pending", color: "#0d7a5f" },
  { id: "5", name: "Omega-3", dosage: "1 g · Capsule", time: "21:00", status: "pending", color: "#c9a84c" },
];

const weekly = [
  { day: "Mon", adherence: 92 },
  { day: "Tue", adherence: 100 },
  { day: "Wed", adherence: 84 },
  { day: "Thu", adherence: 96 },
  { day: "Fri", adherence: 88 },
  { day: "Sat", adherence: 100 },
  { day: "Sun", adherence: 76 },
];

function ProgressRing({ value }: { value: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative grid place-items-center">
      <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
        <circle cx="70" cy="70" r={r} stroke="var(--color-muted)" strokeWidth="12" fill="none" />
        <motion.circle
          cx="70" cy="70" r={r} stroke="url(#ringGrad)" strokeWidth="12" strokeLinecap="round" fill="none"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0d7a5f" />
            <stop offset="100%" stopColor="#c9a84c" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <p className="font-display text-3xl font-bold">{value}%</p>
        <p className="text-xs text-muted-foreground">on track</p>
      </div>
    </div>
  );
}

function Countdown({ time }: { time: string }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);
  const target = useMemo(() => {
    const [h, m] = time.split(":").map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d;
  }, [time]);
  const diff = target.getTime() - now.getTime();
  if (diff < 0) return <span className="text-destructive">overdue</span>;
  const mins = Math.floor(diff / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return <span>in {h > 0 ? `${h}h ` : ""}{m}m</span>;
}

function DashboardPage() {
  const navigate = useNavigate();
  const [doses, setDoses] = useState<Dose[]>(seedDoses);
  const [user, setUser] = useState<{ email?: string; name?: string } | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      if (!u) return;
      setUser({
        email: u.email,
        name: (u.user_metadata?.full_name as string) || u.email?.split("@")[0],
      });
    });
  }, []);

  const takenCount = doses.filter((d) => d.status === "taken").length;
  const adherence = Math.round((takenCount / doses.length) * 100);
  const upcoming = doses.filter((d) => d.status === "pending");
  const missed = doses.filter((d) => d.status === "missed");
  const nextDose = upcoming[0];

  const mark = (id: string, s: Status) => {
    setDoses((prev) => prev.map((d) => (d.id === id ? { ...d, status: s } : d)));
    if (s === "taken") toast.success("Marked as taken");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-md">
              <Pill className="h-5 w-5" />
            </span>
            <span className="hidden font-display font-bold sm:inline">MediCare<span className="text-gold"> AI</span></span>
          </Link>
          <div className="relative hidden max-w-md flex-1 md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input placeholder="Search medicines, doctors…" className="w-full rounded-xl border border-border bg-secondary/40 py-2 pl-10 pr-3 text-sm outline-none focus:border-primary" />
          </div>
          <div className="flex items-center gap-2">
            <button className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-background/60 text-muted-foreground hover:text-foreground"><Bell className="h-4 w-4" /></button>
            <button className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-background/60 text-muted-foreground hover:text-foreground"><Settings className="h-4 w-4" /></button>
            <div className="hidden items-center gap-2 rounded-xl border border-border bg-background/60 px-3 py-1.5 sm:flex">
              <div className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-primary to-gold text-primary-foreground text-xs font-bold">
                {(user?.name || "M").charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium">{user?.name || "Member"}</span>
            </div>
            <button onClick={signOut} className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-background/60 text-muted-foreground hover:text-destructive" aria-label="Sign out"><LogOut className="h-4 w-4" /></button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Greeting */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Good day{user?.name ? `, ${user.name}` : ""}</p>
            <h1 className="mt-1 font-display text-3xl font-bold tracking-tight sm:text-4xl">Today's care plan</h1>
          </div>
          <button className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-[1.02]">
            <Plus className="h-4 w-4" /> Add medicine
          </button>
        </motion.div>

        {/* Overview cards */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Progress ring */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-3xl glass p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Daily progress</h2>
              <span className="text-xs text-muted-foreground">{takenCount}/{doses.length} doses</span>
            </div>
            <div className="mt-4 flex items-center justify-around">
              <ProgressRing value={adherence} />
              <div className="space-y-3">
                <Stat icon={<CheckCircle2 className="h-4 w-4 text-primary" />} label="Taken" value={takenCount} />
                <Stat icon={<Clock className="h-4 w-4 text-gold" />} label="Upcoming" value={upcoming.length} />
                <Stat icon={<XCircle className="h-4 w-4 text-destructive" />} label="Missed" value={missed.length} />
              </div>
            </div>
          </motion.div>

          {/* Next reminder */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-3xl bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground shadow-lg shadow-primary/30">
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
                  <div className="text-right">
                    <p className="text-xs opacity-80">Countdown</p>
                    <p className="text-sm font-semibold"><Countdown time={nextDose.time} /></p>
                  </div>
                </div>
                <button onClick={() => mark(nextDose.id, "taken")} className="mt-6 w-full rounded-xl bg-background/20 py-2.5 text-sm font-semibold backdrop-blur transition-colors hover:bg-background/30">
                  Mark as taken
                </button>
              </>
            ) : (
              <p className="mt-4 text-sm">All caught up. Great job!</p>
            )}
          </motion.div>

          {/* Vitals quick */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-3xl glass p-6">
            <h2 className="font-semibold">Vitals today</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <VitalTile icon={<HeartPulse className="h-4 w-4" />} label="Heart rate" value="72" unit="bpm" />
              <VitalTile icon={<TrendingUp className="h-4 w-4" />} label="BP" value="120/80" unit="mmHg" />
              <VitalTile icon={<Droplet className="h-4 w-4" />} label="Water" value="1.4" unit="L" />
              <VitalTile icon={<Sparkles className="h-4 w-4" />} label="Sugar" value="98" unit="mg/dL" />
            </div>
          </motion.div>
        </div>

        {/* Timeline + chart */}
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-3xl glass p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Today's timeline</h2>
              <Link to="/dashboard" className="text-xs text-primary hover:underline">View all</Link>
            </div>
            <ul className="mt-5 space-y-3">
              {doses.map((d) => (
                <DoseRow key={d.id} dose={d} onMark={(s) => mark(d.id, s)} />
              ))}
            </ul>
          </motion.section>

          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="rounded-3xl glass p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Weekly adherence</h2>
              <span className="text-xs text-muted-foreground">Last 7 days</span>
            </div>
            <div className="mt-4 h-56 w-full">
              <ResponsiveContainer>
                <BarChart data={weekly}>
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0d7a5f" />
                      <stop offset="100%" stopColor="#c9a84c" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} width={30} />
                  <Tooltip cursor={{ fill: "var(--color-muted)", opacity: 0.4 }} contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-card)" }} />
                  <Bar dataKey="adherence" fill="url(#barGrad)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.section>
        </div>

        {/* Calendar placeholder + AI */}
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-3xl glass p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> This week</h2>
              <span className="text-xs text-muted-foreground">Tap a day to view</span>
            </div>
            <div className="mt-5 grid grid-cols-7 gap-2">
              {weekly.map((d, i) => (
                <div key={d.day} className={`rounded-2xl border p-3 text-center ${i === 2 ? "border-primary bg-primary/10" : "border-border bg-background/60"}`}>
                  <p className="text-xs text-muted-foreground">{d.day}</p>
                  <p className="mt-1 font-display text-xl font-bold">{d.adherence}<span className="text-xs">%</span></p>
                </div>
              ))}
            </div>
          </motion.section>

          <motion.aside initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="rounded-3xl border border-gold/30 bg-gradient-to-br from-gold/10 via-background to-primary/5 p-6">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gold/20 text-gold"><Sparkles className="h-4 w-4" /></span>
              <h2 className="font-semibold">AI Assistant</h2>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">Ask about your medicines, side effects, or how to build a healthier routine.</p>
            <div className="mt-4 rounded-2xl border border-border bg-background/70 p-3 text-sm">
              <p className="text-muted-foreground">Try: <em>"Can I take Metformin with vitamin D?"</em></p>
            </div>
            <button className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background">
              <UserIcon className="h-4 w-4" /> Open assistant
            </button>
          </motion.aside>
        </div>
      </main>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {icon}
      <span className="text-muted-foreground">{label}</span>
      <span className="ml-auto font-semibold">{value}</span>
    </div>
  );
}

function VitalTile({ icon, label, value, unit }: { icon: React.ReactNode; label: string; value: string; unit: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background/60 p-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">{icon}<span>{label}</span></div>
      <p className="mt-2 font-display text-xl font-bold">{value}<span className="ml-1 text-xs font-medium text-muted-foreground">{unit}</span></p>
    </div>
  );
}

function DoseRow({ dose, onMark }: { dose: Dose; onMark: (s: Status) => void }) {
  const chip =
    dose.status === "taken"
      ? { text: "Taken", cls: "bg-primary/15 text-primary" }
      : dose.status === "missed"
      ? { text: "Missed", cls: "bg-destructive/15 text-destructive" }
      : { text: "Pending", cls: "bg-gold/15 text-gold" };
  return (
    <li className="flex items-center gap-4 rounded-2xl border border-border bg-background/60 p-4">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ background: `${dose.color}22`, color: dose.color }}>
        <Pill className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{dose.name}</p>
        <p className="truncate text-xs text-muted-foreground">{dose.dosage} · {dose.time}</p>
      </div>
      <span className={`hidden rounded-full px-2.5 py-1 text-xs font-semibold sm:inline ${chip.cls}`}>{chip.text}</span>
      {dose.status === "pending" ? (
        <div className="flex items-center gap-1">
          <button onClick={() => onMark("taken")} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">Take</button>
          <button onClick={() => onMark("missed")} className="rounded-lg border border-border px-2 py-1.5 text-xs text-muted-foreground hover:text-destructive" aria-label="Mark missed"><XCircle className="h-3.5 w-3.5" /></button>
        </div>
      ) : (
        <span className="text-xs text-muted-foreground">
          {dose.status === "taken" ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <XCircle className="h-4 w-4 text-destructive" />}
        </span>
      )}
    </li>
  );
}