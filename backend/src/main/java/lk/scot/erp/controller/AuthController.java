package lk.scot.erp.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import lk.scot.erp.entity.UserAccount;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

	@GetMapping("/me")
	public Map<String, Object> me(@AuthenticationPrincipal UserAccount account) {
		if (account == null) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not signed in");
		}
		return Map.of(
				"id", account.getId(),
				"email", account.getEmail(),
				"fullName", account.getFullName() == null ? "" : account.getFullName(),
				"role", account.getRole().name(),
				"pictureUrl", account.getPictureUrl() == null ? "" : account.getPictureUrl());
	}
}
