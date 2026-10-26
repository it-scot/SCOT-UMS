package lk.scot.erp.controller;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import lk.scot.erp.dto.DashboardSummaryResponse;
import lk.scot.erp.dto.DinnerAllowanceClaimResponse;
import lk.scot.erp.dto.OutOfOfficeResponse;
import lk.scot.erp.entity.UserAccount;
import lk.scot.erp.service.AttendanceService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/employee")
@RequiredArgsConstructor
public class AttendanceController {

	private final AttendanceService attendanceService;

	@GetMapping("/dashboard-summary")
	public DashboardSummaryResponse dashboardSummary(@AuthenticationPrincipal UserAccount account) {
		return attendanceService.getDashboardSummary(requireAccount(account));
	}

	@PostMapping("/attendance/out-of-office")
	public OutOfOfficeResponse toggleOutOfOffice(@AuthenticationPrincipal UserAccount account) {
		return attendanceService.toggleOutOfOffice(requireAccount(account));
	}

	@PostMapping("/attendance/claim-dinner-allowance")
	public DinnerAllowanceClaimResponse claimDinnerAllowance(@AuthenticationPrincipal UserAccount account) {
		return attendanceService.claimDinnerAllowance(requireAccount(account));
	}

	private static UserAccount requireAccount(UserAccount account) {
		if (account == null) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not signed in");
		}
		return account;
	}
}
