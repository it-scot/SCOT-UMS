package lk.scot.erp.service;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import lk.scot.erp.attendance.AttendancePolicy;
import lk.scot.erp.dto.DashboardSummaryResponse;
import lk.scot.erp.dto.DashboardSummaryResponse.AttendanceInfo;
import lk.scot.erp.dto.DashboardSummaryResponse.DinnerAllowanceInfo;
import lk.scot.erp.dto.DashboardSummaryResponse.EmployeeInfo;
import lk.scot.erp.dto.DashboardSummaryResponse.LeaveQuotaItem;
import lk.scot.erp.dto.DashboardSummaryResponse.OutOfOfficeInfo;
import lk.scot.erp.dto.DashboardSummaryResponse.ShiftInfo;
import lk.scot.erp.dto.DashboardSummaryResponse.TimeToLeavePredictor;
import lk.scot.erp.dto.DinnerAllowanceClaimResponse;
import lk.scot.erp.dto.OutOfOfficeResponse;
import lk.scot.erp.entity.Attendance;
import lk.scot.erp.entity.AttendanceStatus;
import lk.scot.erp.entity.Employee;
import lk.scot.erp.entity.EmployeeStatus;
import lk.scot.erp.entity.LeaveRequest;
import lk.scot.erp.entity.LeaveRequestStatus;
import lk.scot.erp.entity.LeaveType;
import lk.scot.erp.entity.ShiftType;
import lk.scot.erp.entity.UserAccount;
import lk.scot.erp.repository.AttendanceRepository;
import lk.scot.erp.repository.EmployeeRepository;
import lk.scot.erp.repository.LeaveRequestRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AttendanceService {

	private static final Set<LeaveRequestStatus> APPROVED_LEAVE = Set.of(
			LeaveRequestStatus.APPROVED_BY_SUPERVISOR,
			LeaveRequestStatus.APPROVED_BY_HR);

	private static final Map<LeaveType, Integer> LEAVE_ALLOCATIONS = allocations();

	private final EmployeeRepository employeeRepository;
	private final AttendanceRepository attendanceRepository;
	private final LeaveRequestRepository leaveRequestRepository;
	private final Clock clock;

	@Transactional
	public DashboardSummaryResponse getDashboardSummary(UserAccount account) {
		Employee employee = resolveEmployee(account);
		Attendance attendance = ensureTodayAttendance(employee);
		return toSummary(employee, attendance);
	}

	@Transactional
	public OutOfOfficeResponse toggleOutOfOffice(UserAccount account) {
		Employee employee = resolveEmployee(account);
		Attendance attendance = ensureTodayAttendance(employee);
		Instant now = clock.instant();

		if (attendance.isOutOfOffice()) {
			int elapsed = elapsedBreakMinutes(attendance, now);
			attendance.setBreakMinutesUsed(attendance.getBreakMinutesUsed() + elapsed);
			attendance.setOutOfOffice(false);
			attendance.setOutOfOfficeStartedAt(null);
		} else {
			attendance.setOutOfOffice(true);
			attendance.setOutOfOfficeStartedAt(now);
		}

		Attendance saved = attendanceRepository.save(attendance);
		OutOfOfficeInfo info = toOutOfOffice(saved, now);
		String message = info.active()
				? "Out-of-office break started. You have " + info.remainingMinutes() + " minutes remaining."
				: "Break ended. " + info.usedMinutes() + " of " + info.allowanceMinutes() + " lunch minutes used.";
		return new OutOfOfficeResponse(
				info.active(),
				info.allowanceMinutes(),
				info.usedMinutes(),
				info.remainingMinutes(),
				message);
	}

	@Transactional
	public DinnerAllowanceClaimResponse claimDinnerAllowance(UserAccount account) {
		Employee employee = resolveEmployee(account);
		Attendance attendance = ensureTodayAttendance(employee);
		LocalTime now = LocalTime.now(clock);

		if (attendance.isDinnerAllowanceClaimed()) {
			return new DinnerAllowanceClaimResponse(
					true,
					AttendancePolicy.DINNER_ALLOWANCE_LKR,
					true,
					"Dinner allowance and transport request were already submitted.");
		}
		if (!AttendancePolicy.isDinnerEligible(now, attendance.getCheckOutTime())) {
			throw new ResponseStatusException(
					HttpStatus.BAD_REQUEST,
					"Dinner allowance can only be claimed after 8:00 PM");
		}

		attendance.setDinnerAllowanceClaimed(true);
		attendance.setOvertimeEligible(true);
		attendanceRepository.save(attendance);
		return new DinnerAllowanceClaimResponse(
				true,
				AttendancePolicy.DINNER_ALLOWANCE_LKR,
				true,
				"Rs. 700 dinner allowance claimed. Campus transport request submitted.");
	}

	Employee resolveEmployee(UserAccount account) {
		return employeeRepository.findByOfficialEmailIgnoreCase(account.getEmail())
				.orElseGet(() -> provisionEmployee(account));
	}

	private Employee provisionEmployee(UserAccount account) {
		Employee employee = new Employee();
		employee.setEmpNumber("EMP-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase(Locale.ROOT));
		employee.setName(account.getFullName() == null || account.getFullName().isBlank()
				? account.getEmail()
				: account.getFullName());
		employee.setOfficialEmail(account.getEmail());
		employee.setDesignation(account.getRole() == null ? "Staff" : titleCase(account.getRole().name()));
		employee.setDepartment(departmentForRole(account));
		employee.setDateJoined(LocalDate.now(clock));
		employee.setStatus(EmployeeStatus.ACTIVE);
		employee.setCurrentShift(ShiftType.NON_ACADEMIC);
		employee.setMinimumDepartureTime(AttendancePolicy.officialEnd(ShiftType.NON_ACADEMIC));
		return employeeRepository.save(employee);
	}

	private Attendance ensureTodayAttendance(Employee employee) {
		LocalDate today = LocalDate.now(clock);
		return attendanceRepository.findByEmployee_IdAndPunchDate(employee.getId(), today)
				.orElseGet(() -> simulateBiometricPunch(employee, today));
	}

	private Attendance simulateBiometricPunch(Employee employee, LocalDate today) {
		LocalTime now = LocalTime.now(clock);
		Attendance attendance = new Attendance();
		attendance.setEmployee(employee);
		attendance.setPunchDate(today);
		if (!now.isBefore(AttendancePolicy.CAMPUS_OPEN)) {
			LocalTime checkIn = AttendancePolicy.officialStart(employee.getCurrentShift()).minusMinutes(8);
			attendance.setCheckInTime(checkIn);
			attendance.setStatus(AttendancePolicy.statusForCheckIn(employee.getCurrentShift(), checkIn));
		} else {
			attendance.setStatus(AttendanceStatus.ABSENT);
		}
		return attendanceRepository.save(attendance);
	}

	private DashboardSummaryResponse toSummary(Employee employee, Attendance attendance) {
		ShiftType shift = employee.getCurrentShift();
		LocalTime now = LocalTime.now(clock);
		LocalTime officialStart = AttendancePolicy.officialStart(shift);
		LocalTime officialEnd = AttendancePolicy.officialEnd(shift);
		LocalTime predicted = AttendancePolicy.predictedDeparture(shift, attendance.getCheckInTime());
		employee.setMinimumDepartureTime(predicted);

		long minutesRemaining = Math.max(0, Duration.between(now, predicted).toMinutes());
		long overtimeMinutes = now.isAfter(officialEnd) ? Duration.between(officialEnd, now).toMinutes() : 0;
		int progress = shiftProgress(officialStart, officialEnd, now);
		boolean overtimeEligible = overtimeMinutes > 0 || attendance.isOvertimeEligible();
		boolean dinnerEligible = AttendancePolicy.isDinnerEligible(now, attendance.getCheckOutTime());

		return new DashboardSummaryResponse(
				new EmployeeInfo(
						employee.getId(),
						employee.getEmpNumber(),
						employee.getName(),
						employee.getDesignation(),
						employee.getDepartment(),
						employee.getOfficialEmail()),
				new AttendanceInfo(
						attendance.getStatus().name(),
						attendance.getCheckInTime(),
						attendance.getCheckOutTime(),
						overtimeEligible,
						attendance.getCheckInTime() != null,
						AttendancePolicy.BIOMETRIC_DEVICE),
				new ShiftInfo(
						shift.name(),
						shift == ShiftType.ACADEMIC ? "Academic" : "Non-Academic",
						officialStart,
						officialEnd),
				new TimeToLeavePredictor(officialEnd, predicted, minutesRemaining, overtimeMinutes, progress),
				leaveQuota(employee),
				new DinnerAllowanceInfo(
						dinnerEligible,
						attendance.isDinnerAllowanceClaimed(),
						AttendancePolicy.DINNER_ALLOWANCE_LKR,
						dinnerEligible),
				toOutOfOffice(attendance, clock.instant()));
	}

	private List<LeaveQuotaItem> leaveQuota(Employee employee) {
		int year = LocalDate.now(clock).getYear();
		List<LeaveRequest> approved = leaveRequestRepository
				.findByEmployee_IdAndStatusIn(employee.getId(), APPROVED_LEAVE);
		EnumMap<LeaveType, Integer> used = new EnumMap<>(LeaveType.class);
		for (LeaveType type : LeaveType.values()) {
			used.put(type, 0);
		}
		for (LeaveRequest request : approved) {
			if (request.getStartDate() == null || request.getStartDate().getYear() != year) {
				continue;
			}
			used.merge(request.getLeaveType(), usedUnits(request), Integer::sum);
		}

		List<LeaveQuotaItem> items = new ArrayList<>();
		LEAVE_ALLOCATIONS.forEach((type, allocated) -> {
			int consumed = used.getOrDefault(type, 0);
			items.add(new LeaveQuotaItem(
					type.name(),
					leaveLabel(type),
					allocated,
					consumed,
					Math.max(0, allocated - consumed)));
		});
		return items;
	}

	private OutOfOfficeInfo toOutOfOffice(Attendance attendance, Instant now) {
		int elapsed = elapsedBreakMinutes(attendance, now);
		int used = attendance.getBreakMinutesUsed() + elapsed;
		int remaining = Math.max(0, AttendancePolicy.BREAK_ALLOWANCE_MINUTES - used);
		return new OutOfOfficeInfo(
				attendance.isOutOfOffice(),
				AttendancePolicy.BREAK_ALLOWANCE_MINUTES,
				used,
				remaining);
	}

	private static int elapsedBreakMinutes(Attendance attendance, Instant now) {
		if (!attendance.isOutOfOffice() || attendance.getOutOfOfficeStartedAt() == null) {
			return 0;
		}
		return (int) Math.max(0, Duration.between(attendance.getOutOfOfficeStartedAt(), now).toMinutes());
	}

	private static int usedUnits(LeaveRequest request) {
		return switch (request.getLeaveType()) {
			case SHORT_30M, SHORT_1H, SHORT_1_5H, SHIFT_SWAP -> 1;
			default -> (int) ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate()) + 1;
		};
	}

	private static int shiftProgress(LocalTime start, LocalTime end, LocalTime now) {
		long total = Duration.between(start, end).toMinutes();
		if (total <= 0) {
			return 0;
		}
		long elapsed = Duration.between(start, now).toMinutes();
		return (int) Math.min(100, Math.max(0, Math.round((elapsed * 100.0) / total)));
	}

	private static String departmentForRole(UserAccount account) {
		if (account.getRole() == null) {
			return "General";
		}
		return switch (account.getRole()) {
			case HR -> "Human Resources";
			case HELPDESK -> "IT Services";
			case ADMIN -> "Administration";
			case EMPLOYEE -> "General";
		};
	}

	private static String titleCase(String value) {
		return value.substring(0, 1).toUpperCase(Locale.ROOT) + value.substring(1).toLowerCase(Locale.ROOT);
	}

	private static String leaveLabel(LeaveType type) {
		return switch (type) {
			case ANNUAL -> "Annual";
			case CASUAL -> "Casual";
			case WFH -> "Work from home";
			case SHORT_30M -> "Short 30m";
			case SHORT_1H -> "Short 1h";
			case SHORT_1_5H -> "Short 1.5h";
			case SHIFT_SWAP -> "Shift swap";
		};
	}

	private static Map<LeaveType, Integer> allocations() {
		EnumMap<LeaveType, Integer> allocations = new EnumMap<>(LeaveType.class);
		allocations.put(LeaveType.ANNUAL, 14);
		allocations.put(LeaveType.CASUAL, 7);
		allocations.put(LeaveType.WFH, 10);
		allocations.put(LeaveType.SHORT_30M, 8);
		allocations.put(LeaveType.SHORT_1H, 8);
		allocations.put(LeaveType.SHORT_1_5H, 8);
		return Map.copyOf(allocations);
	}
}
