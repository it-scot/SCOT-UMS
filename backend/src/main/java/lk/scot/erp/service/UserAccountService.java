package lk.scot.erp.service;

import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lk.scot.erp.entity.UserAccount;
import lk.scot.erp.entity.UserRole;
import lk.scot.erp.repository.UserAccountRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserAccountService {

	private final UserAccountRepository userAccountRepository;

	@Transactional
	public UserAccount upsertFromGoogle(OidcUser oidcUser) {
		String googleSub = oidcUser.getSubject();
		UserAccount account = userAccountRepository.findByGoogleSub(googleSub)
				.or(() -> userAccountRepository.findByEmailIgnoreCase(oidcUser.getEmail()))
				.orElseGet(UserAccount::new);

		account.setGoogleSub(googleSub);
		account.setEmail(oidcUser.getEmail());
		account.setFullName(oidcUser.getFullName());
		account.setPictureUrl(oidcUser.getPicture());
		if (account.getRole() == null) {
			account.setRole(UserRole.EMPLOYEE);
		}
		account.setActive(true);
		return userAccountRepository.save(account);
	}
}
