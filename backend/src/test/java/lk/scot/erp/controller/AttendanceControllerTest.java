package lk.scot.erp.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import lk.scot.erp.dto.DashboardSummaryResponse;
import lk.scot.erp.dto.DashboardSummaryResponse.AttendanceInfo;
import lk.scot.erp.dto.DashboardSummaryResponse.DinnerAllowanceInfo;
import lk.scot.erp.dto.DashboardSummaryResponse.EmployeeInfo;
import lk.scot.erp.dto.DashboardSummaryResponse.OutOfOfficeInfo;
import lk.scot.erp.dto.DashboardSummaryResponse.ShiftInfo;
import lk.scot.erp.dto.DashboardSummaryResponse.TimeToLeavePredictor;
import lk.scot.erp.dto.DinnerAllowanceClaimResponse;
import lk.scot.erp.dto.OutOfOfficeResponse;
import lk.scot.erp.entity.UserAccount;
import lk.scot.erp.service.AttendanceService;

class AttendanceControllerTest {

	private AttendanceService attendanceService;
	private AttendanceController controller;
	private UserAccount account;

	@BeforeEach
	void setUp() {
		attendanceService = mock(AttendanceService.class);
		controller = new AttendanceController(attendanceService);
		account = new UserAccount();
		account.setId(UUID.randomUUID());
		account.setEmail("emp@scot.lk");
	}

	@Test
	void dashboardSummaryRequiresASignedInAccount() {
		assertThatThrownBy(() -> controller.dashboardSummary(null))
				.isInstanceOf(ResponseStatusException.class)
				.hasMessageContaining("Not signed in");
	}

	@Test
	void dashboardSummaryDelegatesToService() {
		DashboardSummaryResponse summary = new DashboardSummaryResponse(
				new EmployeeInfo(UUID.randomUUID(), "EMP-0157", "Ruwan", "Engineer", "IT", "emp@scot.lk"),
				new AttendanceInfo("PRESENT", LocalTime.of(7, 52), null, false, true, "SC-ZK-04"),
				new ShiftInfo("NON_ACADEMIC", "Non-Academic", LocalTime.of(8, 0), LocalTime.of(17, 0)),
				new TimeToLeavePredictor(LocalTime.of(17, 0), LocalTime.of(17, 0), 60, 0, 50),
				List.of(),
				new DinnerAllowanceInfo(false, false, 700, false),
				new OutOfOfficeInfo(false, 20, 0, 20));
		when(attendanceService.getDashboardSummary(account)).thenReturn(summary);

		assertThat(controller.dashboardSummary(account)).isEqualTo(summary);
		verify(attendanceService).getDashboardSummary(account);
	}

	@Test
	void mutationsDelegateToService() {
		when(attendanceService.toggleOutOfOffice(account))
				.thenReturn(new OutOfOfficeResponse(true, 20, 0, 20, "started"));
		when(attendanceService.claimDinnerAllowance(account))
				.thenReturn(new DinnerAllowanceClaimResponse(true, 700, true, "claimed"));

		assertThat(controller.toggleOutOfOffice(account).active()).isTrue();
		assertThat(controller.claimDinnerAllowance(account).amountLkr()).isEqualTo(700);
	}
}
