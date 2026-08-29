import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Bell,
  BellRing,
  Bot,
  CalendarCheck,
  ChevronDown,
  HeartPulse,
  Menu,
  Pill,
  ShieldCheck,
  Sparkles,
  Users,
  Play,
  ArrowRight,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { useState } from "react";
import heroImage from "@/assets/hero-medicine.jpg";

export const Route = createFileRoute("/")({
  component: Landing,
});

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

function Nav() {
  const [open, setOpen] = useState(false);
  const links = [
    { href: "#features", label: "Features" },
    { href: "#how", label: "How it works" },
    { href: "#testimonials", label: "Reviews" },
    { href: "#faq", label: "FAQ" },
    { href: "#contact", label: "Contact" },
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/70 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-md">
            <Pill className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">MediCare<span className="text-gold"> AI</span></span>
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {l.label}
            </a>
          ))}
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <Link to="/auth" className="text-sm font-medium text-muted-foreground hover:text-foreground">Sign in</Link>
          <Link
            to="/auth"
            search={{ mode: "signup" as const }}
            className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background transition-transform hover:scale-[1.03]"
          >
            Get Started <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <button className="md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
          <Menu className="h-6 w-6" />
        </button>
      </nav>
      {open && (
        <div className="border-t border-border/40 bg-background/95 px-6 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="text-sm text-muted-foreground" onClick={() => setOpen(false)}>
                {l.label}
              </a>
            ))}
            <Link to="/auth" className="text-sm font-semibold">Sign in</Link>
          </div>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden gradient-hero">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
        <motion.div initial="hidden" animate="show" variants={fadeUp}>
          <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-gold" /> AI-powered health companion
          </span>
          <h1 className="mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Never Miss Your
            <span className="block bg-gradient-to-r from-primary via-primary/80 to-gold bg-clip-text text-transparent">
              Medicine Again
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            AI-powered medicine reminders with smart notifications, caregiver alerts, health tracking, and complete medication history — beautifully designed for daily care.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/auth"
              search={{ mode: "signup" as const }}
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:shadow-primary/50"
            >
              Get Started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a href="#how" className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-6 py-3 text-sm font-semibold backdrop-blur transition-colors hover:bg-background">
              <Play className="h-4 w-4" /> Watch Demo
            </a>
          </div>
          <div className="mt-10 flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex -space-x-2">
              {["#0d7a5f", "#c9a84c", "#064e3b"].map((c) => (
                <div key={c} className="h-8 w-8 rounded-full border-2 border-background" style={{ background: c }} />
              ))}
            </div>
            <span>Trusted by <span className="font-semibold text-foreground">12,000+</span> patients & caregivers</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="relative aspect-square overflow-hidden rounded-[2.5rem] glass">
            <img
              src={heroImage}
              alt="Floating glass capsule medicine illustration"
              className="h-full w-full object-cover"
              width={1280}
              height={1280}
            />
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute left-6 top-6 flex items-center gap-3 rounded-2xl glass px-4 py-3"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
                <BellRing className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs text-muted-foreground">Next reminder</p>
                <p className="text-sm font-semibold">Metformin · 8:00 AM</p>
              </div>
            </motion.div>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-6 right-6 flex items-center gap-3 rounded-2xl glass px-4 py-3"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gold/20 text-gold">
                <HeartPulse className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs text-muted-foreground">Today's adherence</p>
                <p className="text-sm font-semibold">96% on track</p>
              </div>
            </motion.div>
          </div>
          <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-tr from-primary/20 via-transparent to-gold/20 blur-3xl" />
        </motion.div>
      </div>
    </section>
  );
}

const features = [
  { icon: BellRing, title: "Smart Reminders", desc: "Push, email, and browser notifications that adapt to your schedule." },
  { icon: Bot, title: "AI Health Assistant", desc: "Explains medicines, side effects, and drug interactions in plain language." },
  { icon: HeartPulse, title: "Health Tracking", desc: "Track BP, sugar, weight, water, and heart rate in one place." },
  { icon: Users, title: "Caregiver Alerts", desc: "Auto-notify family if a critical dose is missed." },
  { icon: CalendarCheck, title: "Appointments", desc: "Doctor visits, refill reminders, and prescription uploads." },
  { icon: ShieldCheck, title: "Private & Secure", desc: "End-to-end row-level security. Your data stays yours." },
];

function Features() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-24">
      <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={fadeUp} className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Everything you need</p>
        <h2 className="mt-3 text-3xl font-bold sm:text-4xl">A complete medication companion</h2>
        <p className="mt-4 text-muted-foreground">Beautifully crafted tools that make medication routine effortless.</p>
      </motion.div>
      <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.06 }}
            className="group relative overflow-hidden rounded-3xl glass p-6 transition-all hover:-translate-y-1 hover:shadow-xl"
          >
            <span className="inline-grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-md">
              <f.icon className="h-5 w-5" />
            </span>
            <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

const steps = [
  { n: "01", title: "Add your medicines", desc: "Snap a prescription or add manually with dosage, frequency, and food timing." },
  { n: "02", title: "Set your reminders", desc: "Choose daily, weekly, or custom schedules across all your devices." },
  { n: "03", title: "Stay on track", desc: "Get gentle nudges, ask the AI anything, and watch your adherence grow." },
];

function HowItWorks() {
  return (
    <section id="how" className="relative border-y border-border/50 bg-gradient-to-b from-secondary/40 to-background">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">How it works</p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Three steps to peace of mind</h2>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative rounded-3xl glass p-8"
            >
              <span className="font-display text-5xl font-bold text-gold/40">{s.n}</span>
              <h3 className="mt-4 text-xl font-semibold">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const testimonials = [
  { name: "Sarah M.", role: "Caregiver", quote: "Finally I can breathe. When mom misses a dose, I know instantly. This app is a lifesaver." },
  { name: "Dr. Amit K.", role: "Physician", quote: "I recommend MediCare AI to every patient with chronic conditions. Adherence has improved dramatically." },
  { name: "James T.", role: "Patient", quote: "The AI assistant explains my medicines better than any pamphlet. Beautiful and thoughtful design." },
];

function Testimonials() {
  return (
    <section id="testimonials" className="mx-auto max-w-7xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Loved by families</p>
        <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Real people, real care</h2>
      </div>
      <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
        {testimonials.map((t, i) => (
          <motion.blockquote
            key={t.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="rounded-3xl glass p-7"
          >
            <p className="text-base leading-relaxed text-foreground">&ldquo;{t.quote}&rdquo;</p>
            <footer className="mt-5 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-primary to-gold text-primary-foreground font-semibold">
                {t.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </footer>
          </motion.blockquote>
        ))}
      </div>
    </section>
  );
}

const faqs = [
  { q: "Is MediCare AI free to start?", a: "Yes. Create an account and add your first medicines free — premium family features come later." },
  { q: "How do reminders work?", a: "We send browser push notifications, email, and in-app reminders at your scheduled times." },
  { q: "Can caregivers get alerts?", a: "Yes. Add emergency contacts and they'll be notified if a critical dose is missed by over 30 minutes." },
  { q: "Is my health data secure?", a: "Every record is protected with row-level security. Only you and people you invite can see your data." },
  { q: "Does the AI assistant give medical advice?", a: "The AI explains medicines and healthy habits. It does not replace your doctor — always confirm changes with a professional." },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="relative border-y border-border/50 bg-gradient-to-b from-background to-secondary/30">
      <div className="mx-auto max-w-3xl px-6 py-24">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">FAQ</p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Questions, answered</h2>
        </div>
        <div className="mt-12 space-y-3">
          {faqs.map((f, i) => (
            <div key={f.q} className="rounded-2xl glass">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 p-5 text-left"
              >
                <span className="font-semibold">{f.q}</span>
                <ChevronDown className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${open === i ? "rotate-180" : ""}`} />
              </button>
              <motion.div
                initial={false}
                animate={{ height: open === i ? "auto" : 0, opacity: open === i ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="mx-auto max-w-7xl px-6 py-24">
      <div className="grid gap-10 rounded-[2.5rem] glass p-8 md:p-14 lg:grid-cols-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Contact</p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Talk to our care team</h2>
          <p className="mt-4 text-muted-foreground">We're here to help you set up reminders, connect caregivers, or answer any questions.</p>
          <ul className="mt-8 space-y-4 text-sm">
            <li className="flex items-center gap-3"><Mail className="h-4 w-4 text-primary" /> hello@medicare-ai.app</li>
            <li className="flex items-center gap-3"><Phone className="h-4 w-4 text-primary" /> +1 (555) 010-2024</li>
            <li className="flex items-center gap-3"><MapPin className="h-4 w-4 text-primary" /> Available worldwide</li>
          </ul>
        </div>
        <form className="grid gap-4" onSubmit={(e) => e.preventDefault()}>
          <input className="rounded-xl border border-border bg-background/60 px-4 py-3 text-sm outline-none transition-colors focus:border-primary" placeholder="Your name" />
          <input type="email" className="rounded-xl border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-primary" placeholder="Email address" />
          <textarea rows={4} className="rounded-xl border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-primary" placeholder="How can we help?" />
          <button className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30">
            Send message <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/50 bg-secondary/30">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 py-10 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
            <Pill className="h-4 w-4" />
          </span>
          <span className="font-display font-bold">MediCare<span className="text-gold"> AI</span></span>
        </div>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} MediCare Reminder AI. Care, beautifully organized.</p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <a href="#" className="hover:text-foreground">Privacy</a>
          <a href="#" className="hover:text-foreground">Terms</a>
          <a href="#contact" className="hover:text-foreground">Contact</a>
        </div>
      </div>
    </footer>
  );
}

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
