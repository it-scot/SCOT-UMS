import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarPlus,
  CarFront,
  Clock,
  Coffee,
  Fingerprint,
  LifeBuoy,
  LogIn,
  LogOut,
  RefreshCw,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { StatusPill } from "@/components/erp/StatusPill";
import { SurfaceCard } from "@/components/erp/SurfaceCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { canAccessPath } from "@/auth/dev-session";
import {
  useClaimDinnerAllowance,
  useDashboardSummary,
  useToggleOutOfOffice,
} from "@/hooks/use-employee-dashboard";
import { useNow } from "@/hooks/use-now";
import { useSession } from "@/hooks/use-session";
import type { DashboardSummary } from "@/types/employee-dashboard";
import {
  attendanceStatusLabel,
  dinnerPromptStorageKey,
  formatClock,
  isAfterDinnerCutoff,
  liveShiftProgress,
  minutesPast,
  minutesUntil,
} from "@/utils/attendance";
import { formatDuration } from "@/utils/format";
import { pressableClass } from "@/utils/styles";

export function EmployeeDashboard() {
  const navigate = useNavigate();
  const session = useSession();
  const now = useNow();
  const query = useDashboardSummary();
  const toggleBreak = useToggleOutOfOffice();
  const claimDinner = useClaimDinnerAllowance();
  const [dinnerDismissed, setDinnerDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(dinnerPromptStorageKey(new Date())) === "dismissed";
  });

  const data = query.data;
  const displayName = data?.employee.name ?? session?.user.name ?? "there";
  const firstName = displayName.split(" ")[0] ?? displayName;
  const roleKey = session?.user.roleKey;
  const annual = data?.leaveQuota.find((item) => item.leaveType === "ANNUAL");

  const remaining = now && data ? minutesUntil(data.timeToLeave.predictedDepartureTime, now) : 0;
  const overtime = now && data ? minutesPast(data.shift.endTime, now) : 0;
  const progress = now && data ? liveShiftProgress(data.shift.startTime, data.shift.endTime, now) : 0;
  const breakRemaining = useMemo(() => {
    if (!data) return 20;
    if (!data.outOfOffice.active || !query.dataUpdatedAt || !now) return data.outOfOffice.remainingMinutes;
    const elapsed = Math.floor((now.getTime() - query.dataUpdatedAt) / 60_000);
    return Math.max(0, data.outOfOffice.remainingMinutes - elapsed);
  }, [data, now, query.dataUpdatedAt]);

  const showDinnerPrompt =
    !!data &&
    !data.dinnerAllowance.claimed &&
    !dinnerDismissed &&
    (data.dinnerAllowance.eligible || (!!now && isAfterDinnerCutoff(now)));

  const dismissDinner = () => {
    if (now) sessionStorage.setItem(dinnerPromptStorageKey(now), "dismissed");
    setDinnerDismissed(true);
  };

  if (query.isLoading && !data) {
    return <DashboardSkeleton />;
  }

  if (query.isError && !data) {
    return (
      <div className="mx-auto max-w-7xl">
        <PageHeader eyebrow="Attendance" title="Employee Dashboard" />
        <SurfaceCard>
          <p className="font-sans text-sm text-slate-700">We could not load today&apos;s attendance summary.</p>
          <button
            type="button"
            onClick={() => void query.refetch()}
            className={`mt-4 inline-flex h-10 items-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground ${pressableClass}`}
          >
            Try again
          </button>
        </SurfaceCard>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-7xl">
        <PageHeader eyebrow="Attendance" title="Employee Dashboard" />
        <SurfaceCard>
          <p className="font-sans text-sm text-slate-500">No attendance record is available for today yet.</p>
        </SurfaceCard>
      </div>
    );
  }

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
        <StatusPill status={data.outOfOffice.active ? "On Break" : attendanceStatusLabel(data.attendance.status)} />
      </PageHeader>

      <div className="grid gap-5 lg:grid-cols-3">
        <ShiftCard data={data} progress={progress} />
        <PredictorCard data={data} remaining={remaining} progress={progress} />
        <AttendanceCard data={data} overtime={overtime} now={now} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <BreakTracker
          data={data}
          remaining={breakRemaining}
          pending={toggleBreak.isPending}
          onToggle={() => toggleBreak.mutate()}
        />
        <LeaveQuotaCard
          data={data}
          onApplyLeave={() => {
            toast.success("Leave request opened");
            if (roleKey && canAccessPath(roleKey, "/hr")) void navigate({ to: "/hr" });
          }}
          annualRemaining={annual?.remaining ?? 0}
        />
        <QuickTicketCard
          onRaiseTicket={() => {
            toast.success("Helpdesk opened");
            if (roleKey && canAccessPath(roleKey, "/helpdesk")) void navigate({ to: "/helpdesk" });
          }}
        />
      </div>

      <DinnerAllowanceDialog
        open={showDinnerPrompt}
        amount={data.dinnerAllowance.amountLkr}
        pending={claimDinner.isPending}
        onClaim={() => claimDinner.mutate()}
        onDismiss={dismissDinner}
      />
    </div>
  );
}

function ShiftCard({ data, progress }: { data: DashboardSummary; progress: number }) {
  return (
    <SurfaceCard tone="brand" delay={0}>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-xs tracking-wider uppercase opacity-70">
          <Clock className="size-3.5" /> Working Shift
        </span>
        <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-semibold text-gold-foreground">
          {data.shift.label}
        </span>
      </div>
      <div className="mt-6 font-sans text-3xl font-bold tracking-tight">
        {formatClock(data.shift.startTime)} – {formatClock(data.shift.endTime)}
      </div>
      <p className="mt-1 font-sans text-sm opacity-70">
        {data.employee.department} · {data.employee.designation}
      </p>
      <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-white/15">
        <motion.div
          className="h-full bg-gold"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1 }}
        />
      </div>
      <div className="mt-2 flex justify-between text-[11px] opacity-60">
        <span>{formatClock(data.shift.startTime, "8:00 AM")}</span>
        <span>{progress}% of shift</span>
        <span>{formatClock(data.shift.endTime, "5:00 PM")}</span>
      </div>
    </SurfaceCard>
  );
}

function PredictorCard({
  data,
  remaining,
  progress,
}: {
  data: DashboardSummary;
  remaining: number;
  progress: number;
}) {
  return (
    <SurfaceCard delay={0.05}>
      <div className="flex items-center justify-between">
        <span className="font-sans text-sm font-medium text-slate-900 dark:text-white">Time-to-Leave Predictor</span>
        <span className="flex items-center gap-1 font-sans text-[11px] text-slate-500">
          <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" /> Live
        </span>
      </div>
      <div className="relative mt-3 flex flex-col items-center">
        <Gauge pct={progress / 100} />
        <div className="absolute bottom-0 text-center">
          <div className="font-sans text-2xl font-bold tracking-tight text-slate-900 tabular-nums dark:text-white">
            {formatDuration(remaining)}
          </div>
          <div className="font-sans text-[11px] text-slate-500">
            until {formatClock(data.timeToLeave.predictedDepartureTime)}
          </div>
        </div>
      </div>
      <p className="mt-4 text-center font-sans text-xs text-slate-500">
        Minimum departure{" "}
        <span className="font-medium text-slate-900 dark:text-white">
          {formatClock(data.timeToLeave.predictedDepartureTime)}
        </span>{" "}
        based on {formatClock(data.attendance.checkInTime, "shift start")} check-in
      </p>
    </SurfaceCard>
  );
}

function AttendanceCard({
  data,
  overtime,
  now,
}: {
  data: DashboardSummary;
  overtime: number;
  now: Date | null;
}) {
  const ping = now ? now.getSeconds() % 7 : 4;
  return (
    <SurfaceCard delay={0.1}>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 font-sans text-sm font-medium text-slate-900 dark:text-white">
          <Fingerprint className="size-4 text-steel" /> Attendance
        </span>
        <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
          <RefreshCw className="size-3 animate-spin [animation-duration:3s]" />
          {data.attendance.biometricSynced ? "ZKTeco synced" : "Waiting"}
        </span>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-muted p-3">
          <div className="flex items-center gap-1.5 font-sans text-[11px] text-slate-500">
            <LogIn className="size-3" /> In-Time
          </div>
          <div className="mt-1 font-sans text-lg font-bold text-slate-900 tabular-nums dark:text-white">
            {formatClock(data.attendance.checkInTime)}
          </div>
        </div>
        <div className="rounded-xl bg-muted p-3">
          <div className="flex items-center gap-1.5 font-sans text-[11px] text-slate-500">
            <LogOut className="size-3" /> Out-Time
          </div>
          <div className="mt-1 font-sans text-lg font-bold text-slate-500 tabular-nums">
            {data.attendance.checkOutTime ? formatClock(data.attendance.checkOutTime) : overtime > 0 ? "Pending" : "—:—"}
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between rounded-xl border border-dashed border-slate-300 p-3 dark:border-white/15">
        <span className="font-sans text-xs text-slate-500">Overtime today</span>
        <span className="font-sans font-semibold text-slate-900 tabular-nums dark:text-white">
          {formatDuration(overtime)}
        </span>
      </div>
      <p className="mt-3 font-sans text-[11px] text-slate-500">
        Device {data.attendance.biometricDevice} · last ping {ping}s ago
      </p>
    </SurfaceCard>
  );
}

function BreakTracker({
  data,
  remaining,
  pending,
  onToggle,
}: {
  data: DashboardSummary;
  remaining: number;
  pending: boolean;
  onToggle: () => void;
}) {
  const usedPct =
    data.outOfOffice.allowanceMinutes === 0
      ? 0
      : Math.min(100, ((data.outOfOffice.allowanceMinutes - remaining) / data.outOfOffice.allowanceMinutes) * 100);

  return (
    <SurfaceCard delay={0.15}>
      <div className="flex items-center justify-between">
        <span className="font-sans text-sm font-medium text-slate-900 dark:text-white">Quick Break Tracker</span>
        <StatusPill status={data.outOfOffice.active ? "On Break" : "Available"} />
      </div>
      <p className="mt-2 font-sans text-xs text-slate-500">20-minute lunch / out-of-office counter</p>
      <div className="mt-5 flex items-end justify-between">
        <div>
          <div className="font-sans text-3xl font-bold tracking-tight text-slate-900 tabular-nums dark:text-white">
            {formatDuration(remaining)}
          </div>
          <p className="mt-1 font-sans text-xs text-slate-500">remaining of 20m</p>
        </div>
        <button
          type="button"
          disabled={pending}
          onClick={onToggle}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium ${pressableClass} ${
            data.outOfOffice.active
              ? "bg-amber-50 text-amber-700 border border-amber-200"
              : "bg-secondary text-secondary-foreground shadow-sm"
          }`}
        >
          <Coffee className="size-4" />
          {data.outOfOffice.active ? "End break" : "Start break"}
        </button>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full bg-gold"
          initial={{ width: 0 }}
          animate={{ width: `${usedPct}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
    </SurfaceCard>
  );
}

function LeaveQuotaCard({
  data,
  annualRemaining,
  onApplyLeave,
}: {
  data: DashboardSummary;
  annualRemaining: number;
  onApplyLeave: () => void;
}) {
  const featured = data.leaveQuota.filter((item) => ["ANNUAL", "CASUAL", "WFH"].includes(item.leaveType));
  return (
    <SurfaceCard delay={0.2}>
      <div className="flex items-center justify-between">
        <span className="font-sans text-sm font-medium text-slate-900 dark:text-white">Leave quota</span>
        <button
          type="button"
          onClick={onApplyLeave}
          className={`inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground ${pressableClass}`}
        >
          <CalendarPlus className="size-3.5" /> Apply
        </button>
      </div>
      <div className="mt-4 space-y-3">
        {featured.map((item) => (
          <div key={item.leaveType}>
            <div className="flex items-center justify-between font-sans text-xs text-slate-500">
              <span>{item.label}</span>
              <span>
                {item.remaining} / {item.allocated}
              </span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-steel"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (item.remaining / Math.max(item.allocated, 1)) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 font-sans text-xs text-slate-500">{annualRemaining} annual days remaining this year</p>
    </SurfaceCard>
  );
}

function QuickTicketCard({ onRaiseTicket }: { onRaiseTicket: () => void }) {
  return (
    <SurfaceCard delay={0.25}>
      <span className="font-sans text-sm font-medium text-slate-900 dark:text-white">Campus support</span>
      <p className="mt-2 font-sans text-xs text-slate-500">Raise an IT ticket without leaving the attendance desk.</p>
      <button
        type="button"
        onClick={onRaiseTicket}
        className={`mt-6 flex w-full items-center gap-3 rounded-xl border border-slate-200/80 bg-white px-4 py-3 text-left ${pressableClass} hover:shadow-md`}
      >
        <span className="grid size-10 place-items-center rounded-xl bg-accent text-steel">
          <LifeBuoy className="size-5" />
        </span>
        <span>
          <span className="block font-sans text-sm font-semibold text-slate-900">Raise IT Support Ticket</span>
          <span className="block font-sans text-xs text-slate-500">Avg. response 18 min</span>
        </span>
      </button>
    </SurfaceCard>
  );
}

function DinnerAllowanceDialog({
  open,
  amount,
  pending,
  onClaim,
  onDismiss,
}: {
  open: boolean;
  amount: number;
  pending: boolean;
  onClaim: () => void;
  onDismiss: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-navy/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onDismiss}
          />
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center px-4"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-md backdrop-blur-md">
              <div className="flex items-start justify-between gap-3">
                <div className="grid size-12 place-items-center rounded-2xl bg-gold text-gold-foreground">
                  <UtensilsCrossed className="size-5" />
                </div>
                <button
                  type="button"
                  onClick={onDismiss}
                  className={`grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-muted ${pressableClass}`}
                  aria-label="Dismiss dinner allowance"
                >
                  <X className="size-4" />
                </button>
              </div>
              <h2 className="mt-4 font-sans text-xl font-bold tracking-tight text-slate-900">Still on campus after 8:00 PM</h2>
              <p className="mt-2 font-sans text-sm text-slate-700">
                You can claim the Rs. {amount} dinner allowance and request campus transport in one tap.
              </p>
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 font-sans text-xs font-medium text-amber-700">
                <CarFront className="size-3.5" /> Transport desk will be notified with this claim.
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={pending}
                  onClick={onClaim}
                  className={`inline-flex h-10 items-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground ${pressableClass}`}
                >
                  Claim Rs. {amount}
                </button>
                <button
                  type="button"
                  onClick={onDismiss}
                  className={`inline-flex h-10 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 ${pressableClass}`}
                >
                  Not now
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

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

function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader eyebrow="Attendance" title="Employee Dashboard" />
      <div className="grid gap-5 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-56 animate-pulse rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm"
          />
        ))}
      </div>
    </div>
  );
}
