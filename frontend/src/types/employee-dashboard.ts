export type AttendanceStatusCode = "PRESENT" | "LATE" | "ABSENT" | "HALF_DAY";

export type LeaveQuotaItem = {
  leaveType: string;
  label: string;
  allocated: number;
  used: number;
  remaining: number;
};

export type DashboardSummary = {
  employee: {
    id: string;
    empNumber: string;
    name: string;
    designation: string;
    department: string;
    officialEmail: string;
  };
  attendance: {
    status: AttendanceStatusCode;
    checkInTime: string | null;
    checkOutTime: string | null;
    overtimeEligible: boolean;
    biometricSynced: boolean;
    biometricDevice: string;
  };
  shift: {
    type: "ACADEMIC" | "NON_ACADEMIC";
    label: string;
    startTime: string;
    endTime: string;
  };
  timeToLeave: {
    officialEndTime: string;
    predictedDepartureTime: string;
    minutesRemaining: number;
    overtimeMinutes: number;
    shiftProgressPercent: number;
  };
  leaveQuota: LeaveQuotaItem[];
  dinnerAllowance: {
    eligible: boolean;
    claimed: boolean;
    amountLkr: number;
    transportEligible: boolean;
  };
  outOfOffice: {
    active: boolean;
    allowanceMinutes: number;
    usedMinutes: number;
    remainingMinutes: number;
  };
};

export type OutOfOfficeResponse = {
  active: boolean;
  allowanceMinutes: number;
  usedMinutes: number;
  remainingMinutes: number;
  message: string;
};

export type DinnerAllowanceClaimResponse = {
  claimed: boolean;
  amountLkr: number;
  transportRequested: boolean;
  message: string;
};
