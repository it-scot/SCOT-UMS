package lk.scot.erp.config;

import java.io.IOException;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lk.scot.erp.entity.UserAccount;
import lk.scot.erp.service.JwtService;
import lk.scot.erp.service.UserAccountService;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

	public static final String ACCESS_TOKEN_COOKIE = "scot_access_token";

	private final UserAccountService userAccountService;
	private final JwtService jwtService;
	private final AppProperties appProperties;

	@Override
	public void onAuthenticationSuccess(
			HttpServletRequest request,
			HttpServletResponse response,
			Authentication authentication) throws IOException {
		if (!(authentication.getPrincipal() instanceof OidcUser oidcUser)) {
			response.sendRedirect(appProperties.getFrontendOrigin() + "/");
			return;
		}

		UserAccount account = userAccountService.upsertFromGoogle(oidcUser);
		String token = jwtService.issueToken(account);
		long maxAgeSeconds = Math.max(1, appProperties.getJwt().getExpirationMs() / 1000);

		ResponseCookie cookie = ResponseCookie.from(ACCESS_TOKEN_COOKIE, token)
				.httpOnly(true)
				.secure(request.isSecure())
				.sameSite("Lax")
				.path("/")
				.maxAge(maxAgeSeconds)
				.build();
		response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
		response.sendRedirect(appProperties.getFrontendOrigin() + "/");
	}
}
