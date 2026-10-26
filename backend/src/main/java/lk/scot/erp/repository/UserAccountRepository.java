package lk.scot.erp.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import lk.scot.erp.entity.UserAccount;

public interface UserAccountRepository extends JpaRepository<UserAccount, UUID> {

	Optional<UserAccount> findByGoogleSub(String googleSub);

	Optional<UserAccount> findByEmailIgnoreCase(String email);
}
