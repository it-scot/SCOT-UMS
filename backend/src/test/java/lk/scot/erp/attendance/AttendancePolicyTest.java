package lk.scot.erp.attendance;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalTime;

import org.junit.jupiter.api.Test;

import lk.scot.erp.entity.AttendanceStatus;
import lk.scot.erp.entity.ShiftType;

class AttendancePolicyTest {

	@Test
	void nonAcademicShiftRunsEightToFive() {
		assertThat(AttendancePolicy.officialStart(ShiftType.NON_ACADEMIC)).isEqualTo(LocalTime.of(8, 0));
		assertThat(AttendancePolicy.officialEnd(ShiftType.NON_ACADEMIC)).isEqualTo(LocalTime.of(17, 0));
	}

	@Test
	void academicShiftRunsEightThirtyToFiveThirty() {
		assertThat(AttendancePolicy.officialStart(ShiftType.ACADEMIC)).isEqualTo(LocalTime.of(8, 30));
		assertThat(AttendancePolicy.officialEnd(ShiftType.ACADEMIC)).isEqualTo(LocalTime.of(17, 30));
	}

	@Test
	void earlyCheckInKeepsOfficialEnd() {
		assertThat(AttendancePolicy.predictedDeparture(ShiftType.NON_ACADEMIC, LocalTime.of(7, 52)))
				.isEqualTo(LocalTime.of(17, 0));
	}

	@Test
	void lateCheckInPushesMinimumDeparture() {
		assertThat(AttendancePolicy.predictedDeparture(ShiftType.NON_ACADEMIC, LocalTime.of(8, 20)))
				.isEqualTo(LocalTime.of(17, 20));
	}

	@Test
	void dinnerIsEligibleAtOrAfterEightPm() {
		assertThat(AttendancePolicy.isDinnerEligible(LocalTime.of(19, 59), null)).isFalse();
		assertThat(AttendancePolicy.isDinnerEligible(LocalTime.of(20, 0), null)).isTrue();
		assertThat(AttendancePolicy.isDinnerEligible(LocalTime.of(18, 0), LocalTime.of(20, 5))).isTrue();
	}

	@Test
	void lateStatusUsesTenMinuteGrace() {
		assertThat(AttendancePolicy.statusForCheckIn(ShiftType.NON_ACADEMIC, LocalTime.of(8, 10)))
				.isEqualTo(AttendanceStatus.PRESENT);
		assertThat(AttendancePolicy.statusForCheckIn(ShiftType.NON_ACADEMIC, LocalTime.of(8, 11)))
				.isEqualTo(AttendanceStatus.LATE);
	}
}
