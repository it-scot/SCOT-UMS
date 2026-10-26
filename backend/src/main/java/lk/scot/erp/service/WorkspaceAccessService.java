package lk.scot.erp.service;

import java.util.Locale;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import lk.scot.erp.config.AppProperties;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WorkspaceAccessService {

	private final AppProperties appProperties;

	public boolean isAllowed(String email, String hostedDomain) {
		String allowedDomain = appProperties.getSecurity().getAllowedEmailDomain().toLowerCase(Locale.ROOT);
		String emailDomain = domainOf(email);
		if (allowedDomain.equals(emailDomain)) {
			return true;
		}
		return StringUtils.hasText(hostedDomain) && allowedDomain.equals(hostedDomain.toLowerCase(Locale.ROOT));
	}

	public String requiredDomain() {
		return appProperties.getSecurity().getAllowedEmailDomain();
	}

	private static String domainOf(String email) {
		if (!StringUtils.hasText(email) || !email.contains("@")) {
			return "";
		}
		return email.substring(email.indexOf('@') + 1).toLowerCase(Locale.ROOT);
	}
}
