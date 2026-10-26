package lk.scot.erp.dto;

import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public record DashboardSummaryResponse(
		EmployeeInfo employee,
		AttendanceInfo attendance,
		ShiftInfo shift,
		TimeToLeavePredictor timeToLeave,
		List<LeaveQuotaItem> leaveQuota,
		DinnerAllowanceInfo dinnerAllowance,
		OutOfOfficeInfo outOfOffice
) {

	public record EmployeeInfo(
			UUID id,
			String empNumber,
			String name,
			String designation,
			String department,
			String officialEmail
	) {
	}

	public record AttendanceInfo(
			String status,
			LocalTime checkInTime,
			LocalTime checkOutTime,
			boolean overtimeEligible,
			boolean biometricSynced,
			String biometricDevice
	) {
	}

	public record ShiftInfo(
			String type,
			String label,
			LocalTime startTime,
			LocalTime endTime
	) {
	}

	public record TimeToLeavePredictor(
			LocalTime officialEndTime,
			LocalTime predictedDepartureTime,
			long minutesRemaining,
			long overtimeMinutes,
			int shiftProgressPercent
	) {
	}

	public record LeaveQuotaItem(
			String leaveType,
			String label,
			int allocated,
			int used,
			int remaining
	) {
	}

	public record DinnerAllowanceInfo(
			boolean eligible,
			boolean claimed,
			int amountLkr,
			boolean transportEligible
	) {
	}

	public record OutOfOfficeInfo(
			boolean active,
			int allowanceMinutes,
			int usedMinutes,
			int remainingMinutes
	) {
	}
}
