import { cn } from "@/lib/utils";

const styles = {
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
  success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  progress: "bg-blue-50 text-blue-700 border border-blue-200",
  critical: "bg-rose-50 text-rose-700 border border-rose-200",
} as const;

function tone(status: string) {
  if (["Pending", "Open", "On Leave", "Repair", "High", "Late", "On Break"].includes(status)) return "pending";
  if (["Approved", "Resolved", "Active", "Present", "Available"].includes(status)) return "success";
  if (["In-Progress", "Assigned", "Half Day"].includes(status)) return "progress";
  return "critical";
}

export function StatusPill({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        styles[tone(status)],
        className,
      )}
    >
      {status}
    </span>
  );
}
