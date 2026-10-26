import type { DashboardSummary } from "@/types/employee-dashboard";

export const dashboardSummaryFallback: DashboardSummary = {
  employee: {
    id: "emp-0157",
    empNumber: "EMP-0157",
    name: "Ruwan Jayasinghe",
    designation: "Network Engineer",
    department: "IT Services",
    officialEmail: "emp@scot.lk",
  },
  attendance: {
    status: "PRESENT",
    checkInTime: "07:52:00",
    checkOutTime: null,
    overtimeEligible: false,
    biometricSynced: true,
    biometricDevice: "SC-ZK-04 · Main Gate",
  },
  shift: {
    type: "NON_ACADEMIC",
    label: "Non-Academic",
    startTime: "08:00:00",
    endTime: "17:00:00",
  },
  timeToLeave: {
    officialEndTime: "17:00:00",
    predictedDepartureTime: "17:00:00",
    minutesRemaining: 0,
    overtimeMinutes: 0,
    shiftProgressPercent: 0,
  },
  leaveQuota: [
    { leaveType: "ANNUAL", label: "Annual", allocated: 14, used: 2, remaining: 12 },
    { leaveType: "CASUAL", label: "Casual", allocated: 7, used: 1, remaining: 6 },
    { leaveType: "WFH", label: "Work from home", allocated: 10, used: 0, remaining: 10 },
  ],
  dinnerAllowance: {
    eligible: false,
    claimed: false,
    amountLkr: 700,
    transportEligible: false,
  },
  outOfOffice: {
    active: false,
    allowanceMinutes: 20,
    usedMinutes: 0,
    remainingMinutes: 20,
  },
};
