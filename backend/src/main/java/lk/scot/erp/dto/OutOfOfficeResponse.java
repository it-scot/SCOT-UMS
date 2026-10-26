package lk.scot.erp.dto;

public record OutOfOfficeResponse(
		boolean active,
		int allowanceMinutes,
		int usedMinutes,
		int remainingMinutes,
		String message
) {
}
