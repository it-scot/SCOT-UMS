package lk.scot.erp.dto;

public record DinnerAllowanceClaimResponse(
		boolean claimed,
		int amountLkr,
		boolean transportRequested,
		String message
) {
}
