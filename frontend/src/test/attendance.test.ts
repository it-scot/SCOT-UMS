import { describe, expect, it } from "vitest";
import {
  attendanceStatusLabel,
  formatClock,
  isAfterDinnerCutoff,
  liveShiftProgress,
  minutesUntil,
} from "@/utils/attendance";

describe("Attendance dashboard helpers", () => {
  it("formats ISO times for the shift cards", () => {
    expect(formatClock("08:00:00")).toBe("8:00 AM");
    expect(formatClock("17:30:00")).toBe("5:30 PM");
    expect(formatClock(null)).toBe("—:—");
  });

  it("predicts remaining minutes from the minimum departure time", () => {
    const now = new Date(2026, 9, 26, 16, 30, 0);
    expect(minutesUntil("17:00:00", now)).toBe(30);
  });

  it("opens the dinner prompt after 8:00 PM", () => {
    expect(isAfterDinnerCutoff(new Date(2026, 9, 26, 19, 59, 0))).toBe(false);
    expect(isAfterDinnerCutoff(new Date(2026, 9, 26, 20, 0, 0))).toBe(true);
  });

  it("maps attendance codes to pastel pill labels", () => {
    expect(attendanceStatusLabel("PRESENT")).toBe("Present");
    expect(liveShiftProgress("08:00:00", "17:00:00", new Date(2026, 9, 26, 12, 30, 0))).toBe(50);
  });
});
