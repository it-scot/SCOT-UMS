import { useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  CalendarPlus,
  Clock,
  Coffee,
  Fingerprint,
  LifeBuoy,
  LogIn,
  LogOut,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusPill } from "@/components/erp/StatusPill";
import { SurfaceCard } from "@/components/erp/SurfaceCard";
import { canAccessPath } from "@/auth/dev-session";
import { activity } from "@/data/mock";
import { useNow } from "@/hooks/use-now";
import { useSession } from "@/hooks/use-session";
import { formatDuration } from "@/utils/format";
import { pressableClass } from "@/utils/styles";

const SHIFT_START = 8 * 60;
const SHIFT_END = 17 * 60;

function Gauge({ pct }: { pct: number }) {
  const radius = 70;
  const length = Math.PI * radius;
  return (
    <svg viewBox="0 0 180 100" className="w-full max-w-[240px]">
      <path
        d="M20 90 A70 70 0 0 1 160 90"
        fill="none"
        className="stroke-slate-200 dark:stroke-white/10"
        strokeWidth="14"
        strokeLinecap="round"
      />
      <motion.path
        d="M20 90 A70 70 0 0 1 160 90"
        fill="none"
        className="stroke-gold"
        strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray={length}
        initial={{ strokeDashoffset: length }}
        animate={{ strokeDashoffset: length * (1 - pct) }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
    </svg>
  );
}

export function EmployeeDashboard() {
  const navigate = useNavigate();
  const session = useSession();
  const now = useNow();
  const displayName = session?.user.name ?? "there";
  const firstName = displayName.split(" ")[0] ?? displayName;
  const roleKey = session?.user.roleKey;
  const minutes = now
    ? now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60
    : SHIFT_START;
  const pct = Math.min(1, Math.max(0, (minutes - SHIFT_START) / (SHIFT_END - SHIFT_START)));
  const remaining = Math.max(0, SHIFT_END - minutes);
  const overtime = Math.max(0, minutes - SHIFT_END);

  const actions = [
    {
      label: "Apply Leave",
      icon: CalendarPlus,
      desc: "12 days remaining",
      primary: true,
      run: () => {
        toast.success("Leave request opened");
        if (roleKey && canAccessPath(roleKey, "/hr")) void navigate({ to: "/hr" });
      },
    },
    {
      label: "Raise IT Support Ticket",
      icon: LifeBuoy,
      desc: "Avg. response 18 min",
      primary: false,
      run: () => {
        toast.success("Helpdesk opened");
        if (roleKey && canAccessPath(roleKey, "/helpdesk")) void navigate({ to: "/helpdesk" });
      },
    },
    {
      label: "Out-of-Office Break",
      icon: Coffee,
      desc: "Log a short break",
      primary: false,
      run: () => toast.success("Out-of-office break logged"),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        eyebrow={
          now
            ? now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })
            : "Today"
        }
        title={`Good day, ${firstName}`}
      >
        <StatusPill status="Active" />
      </PageHeader>

      <div className="grid gap-5 lg:grid-cols-3">
        <SurfaceCard tone="brand" delay={0}>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs tracking-wider uppercase opacity-70">
              <Clock className="size-3.5" /> Working Shift
            </span>
            <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-semibold text-gold-foreground">
              Non-Academic
            </span>
          </div>
          <div className="mt-6 text-3xl font-bold tracking-tight">8:00 AM – 5:00 PM</div>
          <p className="mt-1 text-sm opacity-70">Mon – Fri · Administration Block B</p>
          <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-white/15">
            <motion.div
              className="h-full bg-gold"
              initial={{ width: 0 }}
              animate={{ width: `${pct * 100}%` }}
              transition={{ duration: 1 }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[11px] opacity-60">
            <span>8:00</span>
            <span>{Math.round(pct * 100)}% of shift</span>
            <span>17:00</span>
          </div>
        </SurfaceCard>

        <SurfaceCard delay={0.05}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-900 dark:text-white">
              Time-to-Leave Predictor
            </span>
            <span className="flex items-center gap-1 text-[11px] text-slate-500">
              <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" /> Live
            </span>
          </div>
          <div className="relative mt-3 flex flex-col items-center">
            <Gauge pct={pct} />
            <div className="absolute bottom-0 text-center">
              <div className="text-2xl font-bold text-slate-900 tabular-nums dark:text-white">
                {formatDuration(remaining)}
              </div>
              <div className="text-[11px] text-slate-500">until 5:00 PM</div>
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-slate-500">
            Predicted exit <span className="font-medium text-slate-900 dark:text-white">5:04 PM</span>{" "}
            based on 30-day pattern
          </p>
        </SurfaceCard>

        <SurfaceCard delay={0.1}>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-white">
              <Fingerprint className="size-4 text-steel" /> Attendance
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
              <RefreshCw className="size-3 animate-spin [animation-duration:3s]" /> ZKTeco synced
            </span>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-muted p-3">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <LogIn className="size-3" /> In-Time
              </div>
              <div className="mt-1 text-lg font-bold text-slate-900 tabular-nums dark:text-white">
                07:52 AM
              </div>
            </div>
            <div className="rounded-xl bg-muted p-3">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <LogOut className="size-3" /> Out-Time
              </div>
              <div className="mt-1 text-lg font-bold text-slate-500 tabular-nums">
                {overtime > 0 ? "Pending" : "—:—"}
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between rounded-xl border border-dashed border-slate-300 p-3 dark:border-white/15">
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <TrendingUp className="size-3.5" /> Overtime today
            </span>
            <span className="font-semibold text-slate-900 tabular-nums dark:text-white">
              {formatDuration(overtime)}
            </span>
          </div>
          <p className="mt-3 text-[11px] text-slate-500">
            Device SC-ZK-04 · Main Gate · last ping 4s ago
          </p>
        </SurfaceCard>
      </div>

      <h2 className="mt-8 mb-3 text-sm font-medium text-slate-500">Quick actions</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {actions.map((action, index) => (
          <motion.button
            key={action.label}
            type="button"
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.15 + index * 0.05 } }}
            onClick={action.run}
            className={`flex items-center gap-4 rounded-2xl p-4 text-left ${pressableClass} ${
              action.primary
                ? "bg-secondary text-secondary-foreground shadow-md"
                : "border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-[#12203c]/90"
            }`}
          >
            <span
              className={`grid size-11 place-items-center rounded-xl ${
                action.primary ? "bg-gold text-gold-foreground" : "bg-accent text-steel"
              }`}
            >
              <action.icon className="size-5" />
            </span>
            <span>
              <span className="block text-sm font-semibold">{action.label}</span>
              <span className="block text-xs opacity-70">{action.desc}</span>
            </span>
          </motion.button>
        ))}
      </div>

      <SurfaceCard className="mt-8" delay={0.2}>
        <div className="mb-3 text-sm font-medium text-slate-900 dark:text-white">Recent requests</div>
        <div className="divide-y divide-slate-200 text-sm dark:divide-white/10">
          {activity.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 py-3">
              <span>{item.title}</span>
              <StatusPill status={item.status} />
            </div>
          ))}
        </div>
      </SurfaceCard>
    </div>
  );
}
