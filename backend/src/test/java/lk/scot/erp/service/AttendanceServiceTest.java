package lk.scot.erp.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import lk.scot.erp.attendance.AttendancePolicy;
import lk.scot.erp.config.CampusTimeConfig;
import lk.scot.erp.dto.DashboardSummaryResponse;
import lk.scot.erp.dto.DinnerAllowanceClaimResponse;
import lk.scot.erp.dto.OutOfOfficeResponse;
import lk.scot.erp.entity.Attendance;
import lk.scot.erp.entity.AttendanceStatus;
import lk.scot.erp.entity.Employee;
import lk.scot.erp.entity.ShiftType;
import lk.scot.erp.entity.UserAccount;
import lk.scot.erp.entity.UserRole;
import lk.scot.erp.repository.AttendanceRepository;
import lk.scot.erp.repository.EmployeeRepository;
import lk.scot.erp.repository.LeaveRequestRepository;

@ExtendWith(MockitoExtension.class)
class AttendanceServiceTest {

	@Mock
	private EmployeeRepository employeeRepository;

	@Mock
	private AttendanceRepository attendanceRepository;

	@Mock
	private LeaveRequestRepository leaveRequestRepository;

	private AttendanceService attendanceService;
	private UserAccount account;
	private Employee employee;
	private Attendance attendance;

	@BeforeEach
	void setUp() {
		Clock clock = Clock.fixed(
				Instant.parse("2026-10-26T11:00:00Z"),
				CampusTimeConfig.CAMPUS_ZONE);
		attendanceService = new AttendanceService(
				employeeRepository,
				attendanceRepository,
				leaveRequestRepository,
				clock);

		account = new UserAccount();
		account.setId(UUID.randomUUID());
		account.setEmail("emp@scot.lk");
		account.setFullName("Ruwan Jayasinghe");
		account.setRole(UserRole.EMPLOYEE);

		employee = new Employee();
		employee.setId(UUID.randomUUID());
		employee.setEmpNumber("EMP-0157");
		employee.setName("Ruwan Jayasinghe");
		employee.setOfficialEmail("emp@scot.lk");
		employee.setDesignation("Network Engineer");
		employee.setDepartment("IT Services");
		employee.setCurrentShift(ShiftType.NON_ACADEMIC);

		attendance = new Attendance();
		attendance.setId(UUID.randomUUID());
		attendance.setEmployee(employee);
		attendance.setPunchDate(LocalDate.of(2026, 10, 26));
		attendance.setCheckInTime(LocalTime.of(7, 52));
		attendance.setStatus(AttendanceStatus.PRESENT);
	}

	@Test
	void dashboardSummaryUsesCheckInToPredictDeparture() {
		when(employeeRepository.findByOfficialEmailIgnoreCase("emp@scot.lk")).thenReturn(Optional.of(employee));
		when(attendanceRepository.findByEmployee_IdAndPunchDate(employee.getId(), LocalDate.of(2026, 10, 26)))
				.thenReturn(Optional.of(attendance));
		when(leaveRequestRepository.findByEmployee_IdAndStatusIn(any(), any())).thenReturn(List.of());

		DashboardSummaryResponse summary = attendanceService.getDashboardSummary(account);

		assertThat(summary.shift().label()).isEqualTo("Non-Academic");
		assertThat(summary.shift().startTime()).isEqualTo(LocalTime.of(8, 0));
		assertThat(summary.attendance().checkInTime()).isEqualTo(LocalTime.of(7, 52));
		assertThat(summary.timeToLeave().predictedDepartureTime()).isEqualTo(LocalTime.of(17, 0));
		assertThat(summary.outOfOffice().allowanceMinutes()).isEqualTo(20);
		assertThat(summary.dinnerAllowance().amountLkr()).isEqualTo(700);
		assertThat(summary.leaveQuota()).isNotEmpty();
	}

	@Test
	void toggleStartsThenEndsTheLunchBreak() {
		when(employeeRepository.findByOfficialEmailIgnoreCase("emp@scot.lk")).thenReturn(Optional.of(employee));
		when(attendanceRepository.findByEmployee_IdAndPunchDate(employee.getId(), LocalDate.of(2026, 10, 26)))
				.thenReturn(Optional.of(attendance));
		when(attendanceRepository.save(any(Attendance.class))).thenAnswer(invocation -> invocation.getArgument(0));

		OutOfOfficeResponse started = attendanceService.toggleOutOfOffice(account);
		assertThat(started.active()).isTrue();
		assertThat(started.remainingMinutes()).isEqualTo(AttendancePolicy.BREAK_ALLOWANCE_MINUTES);

		OutOfOfficeResponse ended = attendanceService.toggleOutOfOffice(account);
		assertThat(ended.active()).isFalse();
		verify(attendanceRepository, org.mockito.Mockito.times(2)).save(attendance);
	}

	@Test
	void dinnerClaimIsRejectedBeforeEightPm() {
		when(employeeRepository.findByOfficialEmailIgnoreCase("emp@scot.lk")).thenReturn(Optional.of(employee));
		when(attendanceRepository.findByEmployee_IdAndPunchDate(employee.getId(), LocalDate.of(2026, 10, 26)))
				.thenReturn(Optional.of(attendance));

		assertThatThrownBy(() -> attendanceService.claimDinnerAllowance(account))
				.isInstanceOf(ResponseStatusException.class)
				.hasMessageContaining("8:00 PM");
	}

	@Test
	void dinnerClaimSucceedsAfterEightPm() {
		Clock evening = Clock.fixed(Instant.parse("2026-10-26T14:35:00Z"), ZoneId.of("Asia/Colombo"));
		attendanceService = new AttendanceService(
				employeeRepository,
				attendanceRepository,
				leaveRequestRepository,
				evening);
		when(employeeRepository.findByOfficialEmailIgnoreCase("emp@scot.lk")).thenReturn(Optional.of(employee));
		when(attendanceRepository.findByEmployee_IdAndPunchDate(employee.getId(), LocalDate.of(2026, 10, 26)))
				.thenReturn(Optional.of(attendance));
		when(attendanceRepository.save(any(Attendance.class))).thenAnswer(invocation -> invocation.getArgument(0));

		DinnerAllowanceClaimResponse claimed = attendanceService.claimDinnerAllowance(account);

		assertThat(claimed.claimed()).isTrue();
		assertThat(claimed.amountLkr()).isEqualTo(700);
		assertThat(claimed.transportRequested()).isTrue();
		ArgumentCaptor<Attendance> captor = ArgumentCaptor.forClass(Attendance.class);
		verify(attendanceRepository).save(captor.capture());
		assertThat(captor.getValue().isDinnerAllowanceClaimed()).isTrue();
	}
}
