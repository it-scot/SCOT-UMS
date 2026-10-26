import { cn } from "@/lib/utils";

export type Status = "Pending" | "Open" | "Approved" | "Resolved" | "In-Progress" | "Critical" | "High" | "Active" | "On Leave" | "Assigned" | "Repair";

const map: Record<string, string> = {
  pending: "bg-pending-bg text-pending border-pending-border",
  success: "bg-success-bg text-success border-success-border",
  info: "bg-info-bg text-info border-info-border",
  critical: "bg-critical-bg text-critical border-critical-border",
};

const tone = (s: string) =>
  ["Pending", "Open", "On Leave", "Repair"].includes(s)
    ? "pending"
    : ["Approved", "Resolved", "Active"].includes(s)
      ? "success"
      : ["In-Progress", "Assigned"].includes(s)
        ? "info"
        : "critical";

export function StatusPill({ status, className }: { status: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium", map[tone(status)], className)}>
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}
