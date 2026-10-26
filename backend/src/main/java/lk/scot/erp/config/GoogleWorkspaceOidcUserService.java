package lk.scot.erp.config;

import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

import lk.scot.erp.service.WorkspaceAccessService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GoogleWorkspaceOidcUserService extends OidcUserService {

	private final WorkspaceAccessService workspaceAccessService;

	@Override
	public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
		OidcUser oidcUser = super.loadUser(userRequest);
		String hostedDomain = oidcUser.getClaimAsString("hd");
		if (!workspaceAccessService.isAllowed(oidcUser.getEmail(), hostedDomain)) {
			OAuth2Error error = new OAuth2Error(
					"invalid_hosted_domain",
					"Only Google Workspace accounts at @" + workspaceAccessService.requiredDomain() + " may sign in",
					null);
			throw new OAuth2AuthenticationException(error);
		}
		return oidcUser;
	}
}
