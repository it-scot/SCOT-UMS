import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CalendarPlus, Coffee, Fingerprint, LifeBuoy, Clock, TrendingUp, LogIn, LogOut, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/erp/AppShell";
import { StatusPill } from "@/components/erp/StatusPill";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Employee Overview — SCOT Campus ERP" },
      { name: "description", content: "Your shift, live fingerprint attendance and quick actions at SCOT Campus." },
      { property: "og:title", content: "Employee Overview — SCOT Campus ERP" },
      { property: "og:description", content: "Your shift, live fingerprint attendance and quick actions at SCOT Campus." },
    ],
  }),
  component: Dashboard,
});

const SHIFT_START = 8 * 60;
const SHIFT_END = 17 * 60;

function useNow() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

function Card({ children, className = "", delay = 0, dark = false }: { children: React.ReactNode; className?: string; delay?: number; dark?: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }} className={`${dark ? "bg-gradient-navy text-navy-foreground shadow-lg" : "glass glass-hover"} rounded-2xl p-5 ${className}`}>
      {children}
    </motion.div>
  );
}

function Gauge({ pct }: { pct: number }) {
  const r = 70, c = Math.PI * r;
  return (
    <svg viewBox="0 0 180 100" className="w-full max-w-[240px]">
      <path d="M20 90 A70 70 0 0 1 160 90" fill="none" className="stroke-muted" strokeWidth="14" strokeLinecap="round" />
      <motion.path d="M20 90 A70 70 0 0 1 160 90" fill="none" className="stroke-gold" strokeWidth="14" strokeLinecap="round"
        strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - pct) }} transition={{ duration: 1.2, ease: "easeOut" }} />
    </svg>
  );
}

const fmt = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}h ${String(Math.floor(m % 60)).padStart(2, "0")}m`;

function Dashboard() {
  const now = useNow();
  const mins = now ? now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60 : SHIFT_START;
  const pct = Math.min(1, Math.max(0, (mins - SHIFT_START) / (SHIFT_END - SHIFT_START)));
  const left = Math.max(0, SHIFT_END - mins);
  const overtime = Math.max(0, mins - SHIFT_END);

  const actions = [
    { label: "Apply Leave", icon: CalendarPlus, desc: "12 days remaining", primary: true },
    { label: "Raise IT Support Ticket", icon: LifeBuoy, desc: "Avg. response 18 min" },
    { label: "Out-of-Office Break", icon: Coffee, desc: "Log a short break" },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader eyebrow={now ? now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }) : "Today"} title="Good day, Krishan">
        <StatusPill status="Active" />
      </PageHeader>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card dark delay={0}>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs tracking-wider uppercase opacity-70"><Clock className="size-3.5" /> Working Shift</span>
            <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-semibold text-gold-foreground">Non-Academic</span>
          </div>
          <div className="mt-6 text-3xl font-semibold tracking-tight">8:00 AM – 5:00 PM</div>
          <p className="mt-1 text-sm opacity-70">Mon – Fri · Administration Block B</p>
          <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-navy-foreground/15">
            <motion.div className="h-full bg-gold" initial={{ width: 0 }} animate={{ width: `${pct * 100}%` }} transition={{ duration: 1 }} />
          </div>
          <div className="mt-2 flex justify-between text-[11px] opacity-60"><span>8:00</span><span>{Math.round(pct * 100)}% of shift</span><span>17:00</span></div>
        </Card>

        <Card delay={0.05}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Time-to-Leave Predictor</span>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground"><span className="size-1.5 animate-pulse rounded-full bg-success" /> Live</span>
          </div>
          <div className="relative mt-3 flex flex-col items-center">
            <Gauge pct={pct} />
            <div className="absolute bottom-0 text-center">
              <div className="text-2xl font-semibold tabular-nums">{fmt(left)}</div>
              <div className="text-[11px] text-muted-foreground">until 5:00 PM</div>
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">Predicted exit <span className="font-medium text-foreground">5:04 PM</span> based on 30-day pattern</p>
        </Card>

        <Card delay={0.1}>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-medium"><Fingerprint className="size-4 text-steel dark:text-primary" /> Attendance</span>
            <span className="flex items-center gap-1.5 rounded-full border border-success-border bg-success-bg px-2 py-0.5 text-[11px] text-success">
              <RefreshCw className="size-3 animate-spin [animation-duration:3s]" /> ZKTeco synced
            </span>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-muted p-3">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><LogIn className="size-3" /> In-Time</div>
              <div className="mt-1 text-lg font-semibold tabular-nums">07:52 AM</div>
            </div>
            <div className="rounded-xl bg-muted p-3">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><LogOut className="size-3" /> Out-Time</div>
              <div className="mt-1 text-lg font-semibold text-muted-foreground tabular-nums">{overtime > 0 ? "Pending" : "—:—"}</div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between rounded-xl border border-dashed p-3">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><TrendingUp className="size-3.5" /> Overtime today</span>
            <span className="font-semibold tabular-nums">{fmt(overtime)}</span>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">Device SC-ZK-04 · Main Gate · last ping 4s ago</p>
        </Card>
      </div>

      <h2 className="mt-8 mb-3 text-sm font-medium text-muted-foreground">Quick actions</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {actions.map((a, i) => (
          <motion.button key={a.label} whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.15 + i * 0.05 } }}
            onClick={() => toast.success(`${a.label} started`)}
            className={`flex items-center gap-4 rounded-2xl p-4 text-left ${a.primary ? "bg-steel text-primary-foreground shadow-md" : "glass glass-hover"}`}>
            <span className={`grid size-11 place-items-center rounded-xl ${a.primary ? "bg-gold text-gold-foreground" : "bg-accent text-steel dark:text-primary"}`}><a.icon className="size-5" /></span>
            <span>
              <span className="block text-sm font-semibold">{a.label}</span>
              <span className="block text-xs opacity-70">{a.desc}</span>
            </span>
          </motion.button>
        ))}
      </div>

      <Card className="mt-8" delay={0.2}>
        <div className="mb-3 text-sm font-medium">Recent requests</div>
        <div className="divide-y text-sm">
          {[["Annual leave · Nov 3–5", "Pending"], ["Laptop RAM upgrade · TK-1042", "In-Progress"], ["Medical leave · Oct 12", "Approved"], ["Projector failure, Hall 2", "Critical"]].map(([t, s]: string[]) => (
            <div key={t} className="flex items-center justify-between py-3"><span>{t}</span><StatusPill status={s ?? ""} /></div>
          ))}
        </div>
      </Card>
    </div>
  );
}
