export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0] ?? "")
    .join("");
}

export function formatDuration(totalMinutes: number) {
  const minutes = Math.max(0, Math.floor(totalMinutes));
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return `${String(hours).padStart(2, "0")}h ${String(remainder).padStart(2, "0")}m`;
}
