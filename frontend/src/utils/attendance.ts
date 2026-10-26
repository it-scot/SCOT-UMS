export function parseClock(value?: string | null): { hours: number; minutes: number } | null {
  if (!value) return null;
  const [hoursPart, minutesPart] = value.split(":");
  const hours = Number(hoursPart);
  const minutes = Number(minutesPart);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return { hours, minutes };
}

export function formatClock(value?: string | null, fallback = "—:—") {
  const parsed = parseClock(value);
  if (!parsed) return fallback;
  const period = parsed.hours >= 12 ? "PM" : "AM";
  const hour12 = parsed.hours % 12 || 12;
  return `${hour12}:${String(parsed.minutes).padStart(2, "0")} ${period}`;
}

function clockOnDate(value: string, now: Date) {
  const parsed = parseClock(value);
  if (!parsed) return null;
  const target = new Date(now);
  target.setHours(parsed.hours, parsed.minutes, 0, 0);
  return target;
}

export function minutesUntil(value: string | null | undefined, now: Date) {
  const target = value ? clockOnDate(value, now) : null;
  if (!target) return 0;
  return Math.max(0, Math.round((target.getTime() - now.getTime()) / 60_000));
}

export function minutesPast(value: string | null | undefined, now: Date) {
  const target = value ? clockOnDate(value, now) : null;
  if (!target) return 0;
  return Math.max(0, Math.round((now.getTime() - target.getTime()) / 60_000));
}

export function liveShiftProgress(start: string, end: string, now: Date) {
  const startClock = parseClock(start);
  const endClock = parseClock(end);
  if (!startClock || !endClock) return 0;
  const startMin = startClock.hours * 60 + startClock.minutes;
  const endMin = endClock.hours * 60 + endClock.minutes;
  const nowMin = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  if (endMin <= startMin) return 0;
  return Math.round(Math.min(100, Math.max(0, ((nowMin - startMin) / (endMin - startMin)) * 100)));
}

export function isAfterDinnerCutoff(now: Date) {
  return now.getHours() * 60 + now.getMinutes() >= 20 * 60;
}

export function attendanceStatusLabel(status: string) {
  const labels: Record<string, string> = {
    PRESENT: "Present",
    LATE: "Late",
    ABSENT: "Absent",
    HALF_DAY: "Half Day",
  };
  return labels[status] ?? status;
}

export function dinnerPromptStorageKey(now: Date) {
  return `scot-dinner-prompt-${now.toISOString().slice(0, 10)}`;
}
