package lk.scot.erp.attendance;

import java.time.LocalTime;

import lk.scot.erp.entity.AttendanceStatus;
import lk.scot.erp.entity.ShiftType;

public final class AttendancePolicy {

	public static final int SHIFT_HOURS = 9;
	public static final int LATE_GRACE_MINUTES = 10;
	public static final int BREAK_ALLOWANCE_MINUTES = 20;
	public static final int DINNER_ALLOWANCE_LKR = 700;
	public static final LocalTime DINNER_CUTOFF = LocalTime.of(20, 0);
	public static final LocalTime CAMPUS_OPEN = LocalTime.of(6, 0);
	public static final String BIOMETRIC_DEVICE = "SC-ZK-04 · Main Gate";

	private AttendancePolicy() {
	}

	public static LocalTime officialStart(ShiftType shift) {
		return shift == ShiftType.ACADEMIC ? LocalTime.of(8, 30) : LocalTime.of(8, 0);
	}

	public static LocalTime officialEnd(ShiftType shift) {
		return shift == ShiftType.ACADEMIC ? LocalTime.of(17, 30) : LocalTime.of(17, 0);
	}

	public static LocalTime predictedDeparture(ShiftType shift, LocalTime checkIn) {
		LocalTime end = officialEnd(shift);
		if (checkIn == null || checkIn.isBefore(officialStart(shift))) {
			return end;
		}
		return checkIn.plusHours(SHIFT_HOURS);
	}

	public static AttendanceStatus statusForCheckIn(ShiftType shift, LocalTime checkIn) {
		if (checkIn == null) {
			return AttendanceStatus.ABSENT;
		}
		LocalTime lateAfter = officialStart(shift).plusMinutes(LATE_GRACE_MINUTES);
		return checkIn.isAfter(lateAfter) ? AttendanceStatus.LATE : AttendanceStatus.PRESENT;
	}

	public static boolean isDinnerEligible(LocalTime now, LocalTime checkOutTime) {
		if (now != null && !now.isBefore(DINNER_CUTOFF)) {
			return true;
		}
		return checkOutTime != null && !checkOutTime.isBefore(DINNER_CUTOFF);
	}
}
